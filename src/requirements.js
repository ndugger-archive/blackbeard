import Passport from 'passport';

export const isAuthenticated = (strategy = 'local', options = {}) => {
	return true;
}

export default async (rules = []) => {

	if (!Array.isArray(rules)) {
		rules = [rules];
	}

	reqsMet = true;
	for (let rule of rules) {
		if (typeof rule !== 'boolean') {
			console.error('Requirements must be of type boolean');
			break;
		}
		if (rule === false) {
			reqsMet = false;
			break;
		}
	}

	console.log(reqsMet);

	return (controller, action, descriptor) => {

		return descriptor;

	}
}