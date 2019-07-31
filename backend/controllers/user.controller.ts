import { Request } from 'express';
import { ObjectId } from 'mongodb';
import { Logger as PinoLogger } from 'pino';
import {
	Authorized,
	BadRequestError,
	Body,
	CurrentUser,
	Get,
	JsonController,
	Param,
	Params,
	Post,
	Put,
	QueryParam,
	Req,
	UnauthorizedError
} from 'routing-controllers';
import { Inject } from 'typedi';
import { ApplicationsStatus } from '../../shared/globals.enums';
import { Role } from '../../shared/user.enums';
import { Application, ApplicationDto } from '../models/application';
import { IUserModel, User } from '../models/user';
import { StorageService } from '../services/storage.service';
import { hasPermission, userMatches } from '../utils';
import { Logger } from '../utils/logger';
import { GlobalsController } from './globals.controller';

@JsonController('/api/users')
export class UserController {
	@Inject() globalController: GlobalsController;
	@Inject() storageService: StorageService;
	@Logger() logger: PinoLogger;

	@Get('/')
	@Authorized([Role.EXEC])
	async getAll(@QueryParam('sortBy') sortBy?: string, @QueryParam('order') order?: number) {
		order = order === 1 ? 1 : -1;
		sortBy = sortBy || 'createdAt';

		let contains = false;
		User.schema.eachPath(path => {
			if (path.toLowerCase() === sortBy.toLowerCase()) contains = true;
		});
		if (!contains) sortBy = 'createdAt';

		const results = await User.find()
			.sort({ [sortBy]: order })
			.lean()
			.exec();

		return { users: results };
	}

	@Get('/:id/application')
	@Authorized()
	async getUserApplication(@Param('id') id: string, @CurrentUser() currentUser: IUserModel) {
		if (!ObjectId.isValid(id)) throw new BadRequestError('Invalid user ID');
		if (!userMatches(currentUser, id, true))
			throw new UnauthorizedError('You are unauthorized to view this application');
		const user = await User.findById(id)
			.lean()
			.exec();
		if (!user) throw new BadRequestError('User does not exist');

		const appQuery = Application.findOne({ user }).populate('user');
		if (hasPermission(currentUser, Role.EXEC)) appQuery.select('+statusInternal');

		const application = await appQuery.exec();
		return application;
	}

	// TODO: Add tests
	@Get('/application')
	@Authorized()
	async getOwnApplication(@CurrentUser() currentUser: IUserModel) {
		const application = await Application.findOne({ user: currentUser })
			.populate('user')
			.exec();
		return application;
	}

	// Regex because route clashes with get application route above ^
	// Get('/:id')
	@Get(/\/((?!application)[a-zA-Z0-9]+)$/)
	@Authorized([Role.EXEC])
	async getById(@Params() params: string[]) {
		const id = params[0];
		if (!ObjectId.isValid(id)) throw new BadRequestError('Invalid user ID');
		const user = await User.findById(id)
			.lean()
			.exec();

		if (!user) throw new BadRequestError('User does not exist');
		return user;
	}

	// TODO: Add tests
	// Note: Users can only update their names through PUT /users/:id
	@Put('/:id')
	@Authorized()
	async updateById(
		@Param('id') id: string,
		@Body() userDto: { name: string },
		@CurrentUser({ required: true }) currentUser: IUserModel
	) {
		if (!ObjectId.isValid(id)) throw new BadRequestError('Invalid user ID');
		let user = await User.findById(id).exec();
		if (!user) throw new BadRequestError('User not found');
		if (!userMatches(currentUser, id))
			throw new UnauthorizedError('You are unauthorized to edit this profile');

		if (!userDto || !userDto.name || !/([a-zA-Z']+ )+[a-zA-Z']+$/.test(userDto.name))
			throw new BadRequestError('Please provide your first and last name');

		user = await User.findByIdAndUpdate(id, { name: userDto.name }, { new: true })
			.lean()
			.exec();
		return user;
	}

	@Post('/:id/apply')
	@Authorized()
	async apply(
		@Req() req: Request,
		@Param('id') id: string,
		@Body() applicationDto: ApplicationDto,
		@CurrentUser({ required: true }) currentUser: IUserModel
	) {
		if (!ObjectId.isValid(id)) throw new BadRequestError('Invalid user ID');
		const user = await User.findById(id).exec();
		if (!user) throw new BadRequestError('User not found');
		if (!userMatches(currentUser, id))
			throw new UnauthorizedError('You are unauthorized to edit this application');

		const globals = await this.globalController.getGlobals();
		const closed =
			currentUser.role === Role.ADMIN
				? false
				: globals.applicationsStatus === ApplicationsStatus.CLOSED;

		if (closed) throw new UnauthorizedError('Sorry, applications are closed!');

		const files: Express.Multer.File[] = req.files ? (req.files as Express.Multer.File[]) : [];

		const resume = files.find(file => file.fieldname === 'resume');
		if (resume) {
			try {
				applicationDto.resume = await this.storageService.uploadToStorage(
					resume,
					'resumes',
					currentUser
				);
			} catch (error) {
				this.logger.emerg('Error uploading resume:', error);
				throw new BadRequestError('Something is wrong! Unable to upload at the moment!');
			}
		}

		const appQuery = Application.findOneAndUpdate(
			{ user },
			{ ...applicationDto, user },
			{
				new: true,
				upsert: true,
				setDefaultsOnInsert: true
			}
		).populate('user');
		if (hasPermission(currentUser, Role.EXEC)) appQuery.select('+statusInternal');

		const app = await appQuery.exec();
		user.application = app;
		await user.save();
		return app;
	}
}
