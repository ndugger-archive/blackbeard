export default (controller, action, descriptor) => {

	if (typeof controller === 'string' && !action) {
		const url = controller;

		return (controller, action, descriptor) => {
			if (action) {
				descriptor.value.__cors__ = url;
				return descriptor;
			}
			controller.prototype.__cors__ = url;
			return controller;
		}
	}

	const url = '*';
	
	if (action) {
		descriptor.value.__cors__ = url;
		return descriptor;
	}
	controller.__cors__ = url;
	return controller;
}