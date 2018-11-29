 // mouse only stuff
 var EventsManager = (function(d) {
     "use strict";

     function broadcast_data(name, data) {
         var evt = new CustomEvent(name, {
             'detail': data
         }, true, false);
         window.document.dispatchEvent(evt);
     }

     function broadcast_event(name) {
         var evt = null;
         try {
             evt = new Event(name);
         } catch (error) {
             evt = document.createEvent("Event");
             evt.initEvent(name, true, false);
         }
         window.dispatchEvent(evt);
     }

     function _constructor() {
         // lets make it easy for removal
         this.bindings = {
             mouseDownBind: this.onCanvasMouseDown.bind(this),
             mouseMoveBind: this.onCanvasMouseMove.bind(this),
             mouseUpBind: this.onCanvasMouseUp.bind(this),
             imagesLoadedBind: this.onImageLoaded.bind(this)
         };

         this.canvas;
         this.mesh;
        //this.speed = 0.02;
         this.speed = 0.009;

         this.targetRotation = 0;
         this.targetRotationOnMouseDown = 0;
         this.mouseXOnMouseDown = 0;
         // canvas will overwrite these 2
         this.windowHalfX = window.innerWidth / 2;
         this.windowHalfY = window.innerHeight / 2;

         this.lastMousePos = {
             x: 0,
             y: 0
         };

         window.addEventListener("onImageLoaded", this.bindings.imagesLoadedBind, true);

         d.addEventListener('mouseleave', function() {
             console.log("LEAVE >>>>>");
             broadcast_event("onCubeMouseLeave");
             this.killMouseEvents();
         }.bind(this), false);


         d.addEventListener('mouseenter', function() {
             console.log("ENTER <<<<<<<");
             broadcast_event("onCubeMouseEnter");
         }.bind(this), false);

     }


     _constructor.prototype = {
         init: function(ele, mesh) {
             this.canvas = ele;
             this.windowHalfX = (this.canvas.width/ 2) >> 0;
             this.windowHalfY = (this.canvas.height/ 2) >> 0;
             this.mesh = mesh;
             ele.addEventListener('mousedown', this.bindings.mouseDownBind, false);
         },
         onImageLoaded: function() {
             // window.removeEventListener('mousemove', this.bindings.imagesLoadedBind);
             console.log("onImagesLoaded >>>>>");
         },
         onCanvasMouseDown: function(e) {
             //console.log("onCanvasMouseDown >>>>>");
             this.lastMousePos.x = e.clientX;
             this.lastMousePos.y = e.clientY;
             this.killMouseEvents();

             this.canvas.addEventListener('mousemove', this.bindings.mouseMoveBind, false);
             d.addEventListener('mouseup', this.bindings.mouseUpBind, false);

             this.mouseXOnMouseDown = e.clientX - this.windowHalfX;
             // this is rads
             this.targetRotationOnMouseDown =  this.mesh.rotation.y;

             broadcast_event("onCubeTouch");
             e.preventDefault();
         },

         onCanvasMouseMove: function(e) {
             var mouseX = e.clientX - this.windowHalfX;
             var currentRotation = this.targetRotationOnMouseDown + (mouseX - this.mouseXOnMouseDown) * this.speed;
             this.mesh.rotation.y = currentRotation;

             broadcast_data("onMouseMoveCube");
         },
         onCanvasMouseUp: function(e) {
             broadcast_event("onCubeTouchEnd");
             this.killMouseEvents();
             // check for that click
             if (e.clientX == this.lastMousePos.x && e.clientY == this.lastMousePos.y) {
                 // this must send the same event name as the touchevent
                
                 broadcast_data("onTapped");
             }
         },

         killMouseEvents: function() {
             // don't forget to remove event, otherwise you'll get lots of them stacked-up
             this.canvas.removeEventListener('mousemove', this.bindings.mouseMoveBind);
             d.removeEventListener('mouseup', this.bindings.mouseUpBind);
         }

     }

     return _constructor;
 })(document)