export default (rules = []) => {

	if (!Array.isArray(rules)) rules = [rules];

	return (controller, action, descriptor) => {
		if (action) {
			descriptor.value.requirements = rules;
			return descriptor;
		}
		else {
			return controller;
		}
	}
}