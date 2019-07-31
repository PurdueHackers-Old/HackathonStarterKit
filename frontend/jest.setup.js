const Enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');

// @ts-ignore
Enzyme.configure({ adapter: new Adapter() });
