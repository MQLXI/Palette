/*
* @Author: admin
* @Date:   2017-10-10 10:54:49
* @Last Modified by:   admin
* @Last Modified time: 2017-10-27 13:49:25
*/
/**
 * 属性：
 * 		线宽、颜色、端点样式、填充/描边、边数
 * 方法：
 * 		画线、虚线、矩形、多边形、多角形、圆、铅笔、文字
 * 		橡皮、撤销、裁切、新建、保存
 */

class Palette{
	constructor(canvas, marks){
		this.canvas = canvas;
		this.ctx = this.canvas.getContext("2d");
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		this.marks = marks;    /* 遮罩 */
		this.eraser = '';    /* 橡皮檫 */
		this.editBox = '';    /* 文本编辑框 */
		this.selectedArea = '';    /* 选区 */
		this.parentNode = this.canvas.parentNode;
		this.fontSize = 14;
		this.fontFamily = '微软雅黑';

		/* 设置默认ctx属性 */
		this.lineWidth = 1;
		this.style = 'stroke';
		this.lineStyle = 'solid';
		this.fillStyle = '#000';
		this.strokeStyle = '#000';
		this.color = '#000';
		this.gradient = '';
		this.lineCap = 'butt';

		this.angleNum = 3;
		this.borderNum = 3;

		/* 保存历史记录 */
		this.history = [];
		this.historyMaxLength = 100;

		/* 初始化环境 */
		this.init();

	}
	line(cx, cy, ox, oy, lineStyle){
		this.ctx.moveTo(cx, cy);
		this.ctx.lineTo(ox, oy);
		this.ctx.closePath();
		if(lineStyle && typeof(lineStyle) == 'boolean'){
			this.ctx.setLineDash([5, 10]);
		}else{
			this.ctx.setLineDash([5, 0]);
		}
		this.ctx.stroke();
	}
	dash(cx, cy, ox, oy){
		this.line(cx, cy, ox, oy, true);
	}
	ploy(cx, cy, ox, oy){
		let angle = Math.PI*2/this.borderNum;
		let radius = Math.sqrt(Math.pow(ox-cx,2)+Math.pow(oy-cy,2));
		this.ctx.moveTo(cx+Math.cos(angle*0)*radius, cy+Math.sin(angle*0)*radius);
		for(let i = 0; i < this.borderNum; i++){
			this.ctx.lineTo(cx+Math.cos(angle*i)*radius, cy+Math.sin(angle*i)*radius);
		}
		this.ctx.closePath();
		this.ctx[this.style]();
	}
	ployJ(cx, cy, ox, oy){
		let angle = Math.PI*2/(this.angleNum*2);
		let radius1 = Math.sqrt(Math.pow(ox-cx,2)+Math.pow(oy-cy,2));
		let radius2 = radius1*2/5;
		for(let i = 0; i < this.angleNum*2; i++){
			let r = i % 2 ? radius1 : radius2;
			this.ctx.lineTo(cx+Math.cos(angle*i-(Math.PI/4))*r, cy+Math.sin(angle*i-(Math.PI/4))*r);
		}
		this.ctx.closePath();
		this.ctx[this.style]();
	}
	rectangle(cx, cy, ox, oy){
		this.ctx.moveTo(cx, cy);
		this.ctx.lineTo(cx, oy);
		this.ctx.lineTo(ox, oy);
		this.ctx.lineTo(cx, oy);
		this.ctx.lineTo(cx, cy);
		this.ctx[this.style]();
	}
	circle(cx, cy, ox, oy){
		let radius = Math.sqrt(Math.pow(ox-cx,2)+Math.pow(oy-cy,2));
		this.ctx.arc(cx, cy, radius, 0, Math.PI*2);
		this.ctx[this.style]();
	}
	pencil(cx, cy, ox, oy){
		this.ctx.lineTo(ox, oy);
		this.ctx.stroke();
	}
	clear(){
		this.canvas.onmousedown = function(e){
			let cx = e.offsetX, cy = e.offsetY;
			this.addEraser();
			this.eraser.style.width = `${this.lineWidth}px`;
			this.eraser.style.height = `${this.lineWidth}px`;
			this.eraser.style.top = `${cy + this.lineWidth/2 - 5}px`;
			this.eraser.style.left = `${cx + this.lineWidth/2 - 5}px`;
			this.ctx.clearRect(cx - this.lineWidth/2, cy - this.lineWidth/2, this.lineWidth, this.lineWidth);
			this.marks.onmousemove = function(e){/* marks与canvas 之间的左边与上边存在5px的间距 */
				let ox = e.offsetX-5, oy = e.offsetY-5;
				this.eraser.style.top = `${oy - this.lineWidth/2 + 5}px`;
				this.eraser.style.left = `${ox - this.lineWidth/2 + 5}px`;
				this.ctx.clearRect((ox - this.lineWidth/2), (oy - this.lineWidth/2), this.lineWidth, this.lineWidth);
			}.bind(this);
			this.marks.onmouseup = function(e){
				this.history.push(this.ctx.getImageData(0, 0, this.width, this.height));
				this.marks.onmousemove = null;
				this.marks.onmouseup = null;
				this.removeEraser();
			}.bind(this);
		}.bind(this);
	}
	edit(){
		let cx, cy;
		this.canvas.onmousedown = function(e){
			if(this.parentNode.children.length > 1){
				return;
			}
			cx = e.offsetX;
			cy = e.offsetY;
			this.addEditBox();
			this.addMarks();
			this.editBox.style.width = `${0}px`;
			this.editBox.style.height = `${0}px`;
			this.marks.onmousemove = function(e){
				let ox = e.offsetX, oy = e.offsetY;
				let minX = ox > cx ? cx + this.lineWidth/2 + 5 : ox + this.lineWidth/2 + 5;
				let minY = oy > cy ? cy + this.lineWidth/2 + 5 : oy + this.lineWidth/2 + 5;
				this.editBox.style.left = `${minX}px`;
				this.editBox.style.top = `${minY}px`;
				this.editBox.style.width = `${Math.abs(ox - cx)}px`;
				this.editBox.style.height = `${Math.abs(oy - cy)}px`;
			}.bind(this);
			this.marks.onmouseup = function(e){
				this.history.push(this.ctx.getImageData(0, 0, this.width, this.height));
				this.marks.onmousemove = null;
				this.marks.onmouseup = null;
				this.removeMarks();
				// this.removeEditBox();
			}.bind(this);

			this.editBox.onmousedown = function(e){
				let cx = e.offsetX, cy = e.offsetY;
				this.addMarks();
				this.marks.onmousemove = function(e){
					let ox = e.offsetX, oy = e.offsetY;
					this.editBox.style.top = `${oy - cy}px`;
					this.editBox.style.left = `${ox - cx}px`;
				}.bind(this);
				this.marks.onmouseup = function(e){
					this.history.push(this.ctx.getImageData(0, 0, this.width, this.height));
					this.marks.onmousemove = null;
					this.marks.onmouseup = null;
					this.removeMarks();
					// this.removeEditBox();
				}.bind(this);
			}.bind(this);
			this.editBox.onblur = function(e){
				this.initStyle();
				this.ctx[this.style + 'Text'](this.editBox.innerHTML.replace(/<div>|<br>/g, '\
					').replace(/<\/div>/g, '').replace(/&nbsp;/g, ' '), 
					parseInt(this.editBox.style.left), parseInt(this.editBox.style.top)+5);
				this.history.push(this.ctx.getImageData(0, 0, this.width, this.height));
				this.editBox.innerHTML = '';
				this.editBox.onmousedown = null;
				this.removeEditBox();
			}.bind(this);
		}.bind(this);
	}
	select(){
		let temp;
		this.canvas.onmousedown = function(e){
			if(this.parentNode.children.length > 1){
				return;
			}
			let cx = e.offsetX,	cy = e.offsetY;
			let minX, minY, w, h;
			this.addSelectedArea();
			this.addMarks();
			this.selectedArea.style.width = `${0}px`;
			this.selectedArea.style.height = `${0}px`;
			this.marks.onmousemove = function(e){
				let ox = e.offsetX, oy = e.offsetY;
				minX = ox > cx ? cx : ox;
				minY = oy > cy ? cy : oy;
				w = Math.abs(ox - cx);
				h = Math.abs(oy - cy);
				this.selectedArea.style.left = `${minX}px`;
				this.selectedArea.style.top = `${minY}px`;
				this.selectedArea.style.width = `${w}px`;
				this.selectedArea.style.height = `${h}px`;
			}.bind(this);
			this.marks.onmouseup = function(e){
				temp = this.ctx.getImageData(minX-5, minY-5, w, h);
				this.ctx.clearRect(minX-5, minY-5, w, h);
				this.history.push(this.ctx.getImageData(0, 0, this.width, this.height));
				this.marks.onmousemove = null;
				this.marks.onmouseup = null;
				this.removeMarks();
			}.bind(this);
			this.selectedArea.onmousedown = function(e){
				let cx = e.offsetX, cy = e.offsetY;
				this.ctx.clearRect(minX-5, minY-5, w, h);
				this.addMarks();
				this.marks.onmousemove = function(e){
					let ox = e.offsetX, oy = e.offsetY;
					this.selectedArea.style.top = `${oy - cy}px`;
					this.selectedArea.style.left = `${ox - cx}px`;
					this.ctx.clearRect(0, 0, this.width, this.height);
					if(this.history.length){
						this.ctx.putImageData(this.history[this.history.length-1], 0, 0);
					}
					this.ctx.putImageData(temp, ox - cx - 5, oy - cy - 5);
				}.bind(this);
				this.marks.onmouseup = function(e){
					this.history.push(this.ctx.getImageData(0, 0, this.width, this.height));
					this.marks.onmousemove = null;
					this.marks.onmouseup = null;
					this.selectedArea.onmousedown = null;
					this.removeMarks();
					this.removeSelectedArea();
				}.bind(this);
			}.bind(this);
			this.selectedArea.onblur = function(e){
				this.selectedArea.onmousedown = null;
				this.removeSelectedArea();
			}.bind(this);
		}.bind(this);
	}
	clean(){
		this.ctx.clearRect(0, 0, this.width, this.height);
		this.history.push(this.ctx.getImageData(0, 0, this.width, this.height));
	}
	/* 反向 */
	reverse(){
		let imageDeata = this.ctx.getImageData(0, 0, this.width, this.height);
		for(let i = 0; i < imageDeata.data.length; i += 4){
			imageDeata.data[i] = 255 - imageDeata.data[i];
			imageDeata.data[i + 1] = 255 - imageDeata.data[i + 1];
			imageDeata.data[i + 2] = 255 - imageDeata.data[i + 2];
		}
		this.ctx.setImageData(imageDeata, 0, 0);
		this.history.push(this.ctx.getImageData(0, 0, this.width, this.height));
	}
	/* 变灰 */
	gray(){
		let imageDeata = this.ctx.getImageData(0, 0, this.width, this.height);
		for(let i = 0; i < imageDeata.data.length; i += 4){
			imageDeata.data[i] = imageDeata.data[i + 1] = imageDeata.data[i + 2] = (imageDeata.data[i] +
						 imageDeata.data[i + 1] + imageDeata.data[i + 2]) / 3;
		}
		this.ctx.setImageData(imageDeata, 0, 0);
		this.history.push(this.ctx.getImageData(0, 0, this.width, this.height));
	}

	/* 画图 */
	draw(type){
		if(type == 'clear'){
			this.clear();
			return;
		}else if(type == 'edit'){
			this.edit();
			return;
		}else if(type == 'select'){
			this.select();
			return;
		}
		else if(type == 'clean'){
			this.clean();
			return;
		}
		this.canvas.onmousedown = function(e){
			let cx = e.offsetX, cy = e.offsetY;
			this.initStyle();
			this.ctx.beginPath();
			this.canvas.onmousemove = function(e){
				let ox = e.offsetX, oy = e.offsetY;
				if(type == 'pencil'){
					this[type](cx, cy, ox, oy);
					return;
				}
				this.ctx.clearRect(0, 0, this.width, this.height);
				if(this.history.length){
					this.ctx.putImageData(this.history[this.history.length-1], 0, 0);
				}
				this.ctx.beginPath();
				this[type](cx, cy, ox, oy);
			}.bind(this);
			this.canvas.onmouseup = function(){
				this.ctx.closePath();
				this.history.push(this.ctx.getImageData(0, 0, this.width, this.height));
				this.canvas.onmousemove = null;
				this.canvas.onmouseup = null;
			}.bind(this);
		}.bind(this);
	}

	/* 添加、清除遮罩，橡皮檫，文本编辑框 */
	addEraser(){
		this.parentNode.appendChild(this.eraser);
		this.parentNode.appendChild(this.marks);
	}
	removeEraser(){
		this.parentNode.removeChild(this.eraser);
		this.parentNode.removeChild(this.marks);
	}
	addEditBox(){
		this.parentNode.appendChild(this.editBox);
	}
	removeEditBox(){
		this.parentNode.removeChild(this.editBox);
	}
	addMarks(){
		this.parentNode.appendChild(this.marks);
	}
	removeMarks(){
		this.parentNode.removeChild(this.marks);
	}
	addSelectedArea(){
		this.parentNode.appendChild(this.selectedArea);
	}
	removeSelectedArea(){
		this.parentNode.removeChild(this.selectedArea);
	}
	/* 初始化键盘环境 */
	init(){
		document.onkeydown = function(e){
			if(e.ctrlKey && (e.keyCode == 90)){
				if(!this.history.length)
					return;
				this.history.pop();
				this.ctx.clearRect(0, 0, this.width, this.height);
				this.ctx.putImageData(this.history[this.history.length-1], 0, 0);
			}
		}.bind(this);

		this.eraser = document.createElement('div');
		this.eraser.className = 'eraser';
		this.eraser.style.cssText = `
			width: 20px;
			height: 20px;
			background: #128998;
			position: absolute;
			top: 0;
			left: 0;
		`;
		this.marks = document.createElement('div');
		this.marks.className = 'marks';
		this.marks.style.cssText = `
			background: none;
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
		`;
		this.editBox = document.createElement('div');
		this.editBox.className = 'editBox';
		this.editBox.contentEditable = true;
		this.editBox.style.cssText = `
			background: none;
			border: 1px dashed #ccc;
			position: absolute;
			top: 0;
			left: 0;
			cursor: move;
		`;
		this.selectedArea = document.createElement('div');
		this.selectedArea.className = 'selectedArea';
		this.selectedArea.style.cssText = `
			background: none;
			border: 1px dashed #ccc;
			position: absolute;
			top: 0;
			left: 0;
			cursor: move;
		`;
	}
	/* 设置画图样式 */
	initStyle(){
		this.ctx.lineWidth = this.lineWidth;
		this.ctx.fillStyle = this.color;
		this.ctx.strokeStyle = this.color;
		this.ctx.lineCap = this.lineCap;
		this.lineStyle == 'solid' ? this.ctx.setLineDash([0, 0]) : this.ctx.setLineDash([5, 10]);
		this.ctx.font = `${this.fontSize}px ${this.fontFamily}`;
	}
}