/*
* @Author: admin
* @Date:   2017-10-10 16:11:07
* @Last Modified by:   admin
* @Last Modified time: 2017-10-12 10:19:21
*/
onload = function(){
	let canvas = document.querySelector('canvas');
	let pal = new Palette(canvas);

	let tools = document.querySelectorAll('.tool');
	
	tools.forEach((element)=>{
		element.onclick = ()=>{
			document.querySelector('[active=true]').setAttribute('active', false);
			element.setAttribute('active', true);
			pal.draw(element.id);
		}
	});
	pal.draw('line');

	let arg = document.querySelectorAll('.argument');
	arg.forEach((element)=>{
		element.onload = ()=>{
			pal[element.id] = element.value || element.innerHTML;
		};
		element.onchange = ()=>{
			pal[element.id] = element.value || element.innerHTML;
		};
	});

	let save = document.querySelector('a.save');
	save.onclick = ()=>{
		let data = canvas.toDataURL('image/png');
		save.href = data;
		save.download = new Date().getTime() + '.png';

	}

}