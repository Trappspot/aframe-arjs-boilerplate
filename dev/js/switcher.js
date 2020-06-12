const myCustomEntity = document.querySelector(".my-custom-entity");

const boxBtn = document.querySelector(".switcher > .box");
const sphereBtn = document.querySelector(".switcher > .sphere");

boxBtn.addEventListener("click", () => {
	myCustomEntity.setAttribute("geometry", "primitive", "box");
	myCustomEntity.setAttribute(
		"material",
		"src",
		"public/img/texture/metal.jpg"
	);
});

sphereBtn.addEventListener("click", () => {
	myCustomEntity.setAttribute("geometry", "primitive", "sphere");
	myCustomEntity.setAttribute(
		"material",
		"src",
		"public/img/texture/globe.jpg"
	);
});
