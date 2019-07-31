import { Interceptor, InterceptorInterface, Action } from 'routing-controllers';

@Interceptor()
export class SuccessInterceptor implements InterceptorInterface {
	intercept(action: Action, content: any) {
		// Workaround because _id of a Mongo Document gets serialized to BSON ObjectId instead of String
		return { status: 200, response: JSON.parse(JSON.stringify(content || '')) };
		// return { status: 200, response: content };
	}
}
