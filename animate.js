 var Animate = (function() {
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


     function my_constructor() {
         console.log("animate says hi");

         this.targetRotation = 0;
         this.targetRotationOnMouseDown = 0;
         this.mouseX = 0;
         this.mouseXOnMouseDown = 0;
         this.windowHalfX = window.innerWidth / 2;
         this.speed = 0.008;
         this.spinAmount = 0;
         this.stallCubeBool = false;
         this.viewFaceTimeout = 0;


         this.point90 = false;
         this.point180 = false;
         this.point270 = false;
         this.point359 = false;



         Object.defineProperty(this, "cube_camera", {
             enumerable: true,
             configurable: false,
             set: function(o) {
                 this.$camera = o;
             }
         });

         Object.defineProperty(this, "cube_scene", {
             enumerable: true,
             configurable: false,
             set: function(o) {
                 this.$scene = o;
             }
         });


         Object.defineProperty(this, "cube_mesh", {
             enumerable: true,
             configurable: false,
             set: function(o) {
                 this.$mesh = o;
             }
         });
         Object.defineProperty(this, "cube_renderer", {
             enumerable: true,
             configurable: false,
             set: function(o) {
                 this.$renderer = o;

             }
         });

         Object.defineProperty(this, "initial_cube_rotation", {
             enumerable: true,
             configurable: false,
             set: function(n) {
                 this.$initialCubeRotation = n;
             }
         });
         this.userdown = false;

         // binding like this makes removeevent work properly
         this.animationBind = this.animate.bind(this);
         // mouse stuff
         this.onDocumentMouseDownBind = this.onDocumentMouseDown.bind(this);
         this.onDocumentMouseMoveBind = this.onDocumentMouseMove.bind(this);
         this.onDocumentMouseUpBind = this.onDocumentMouseUp.bind(this);
         this.onDocumentMouseOutBind = this.onDocumentMouseOut.bind(this);
         document.addEventListener('mousedown', this.onDocumentMouseDownBind, false);
         //  touch stuff
         this.onDocumentTouchBind = this.onDocumentTouchStart.bind(this);
         this.onDocumentTouchMoveBind = this.onDocumentTouchMove.bind(this);
         document.addEventListener('touchstart', this.onDocumentTouchBind, false);
         document.addEventListener('touchmove', this.onDocumentTouchMoveBind, false);



     }

     my_constructor.prototype = {

         onDocumentTouchStart: function(event) {
             if (event.touches.length == 1) {
                 //  event.preventDefault();
                 this.mouseXOnMouseDown = event.touches[0].pageX - this.windowHalfX;
                 this.targetRotationOnMouseDown = this.targetRotation;
                 this.userdown = true;
                 this.stallCubeBool = false;
             }
         },
         onDocumentTouchMove: function(event) {
             if (event.touches.length == 1) {
                 //  event.preventDefault();
                 this.mouseX = event.touches[0].pageX - this.windowHalfX;
                 this.targetRotation = this.targetRotationOnMouseDown + (this.mouseX - this.mouseXOnMouseDown) * 0.05;
             }
         },

         onDocumentMouseDown: function(e) {
             e.preventDefault();
             this.mouseXOnMouseDown = e.clientX - this.windowHalfX;
             this.targetRotationOnMouseDown = this.targetRotation;
             this.userdown = true;
             this.stallCubeBool = false;

             document.addEventListener('mousemove', this.onDocumentMouseMoveBind, false);
             document.addEventListener('mouseup', this.onDocumentMouseUpBind, false);
             document.addEventListener('mouseout', this.onDocumentMouseOutBind, false);

         },
         onDocumentMouseMove: function(e) {
             this.mouseX = e.clientX - this.windowHalfX;
             this.targetRotation = this.targetRotationOnMouseDown + (this.mouseX - this.mouseXOnMouseDown) * 0.06;
         },

         onDocumentMouseUp: function() {
             document.removeEventListener('mousemove', this.onDocumentMouseMoveBind, false);
             document.removeEventListener('mouseup', this.onDocumentMouseUpBind, false);
             document.removeEventListener('mouseout', this.onDocumentMouseOutBind, false);

         },
         onDocumentMouseOut: function() {
             document.removeEventListener('mousemove', this.onDocumentMouseMoveBind, false);
             document.removeEventListener('mouseup', this.onDocumentMouseUpBind, false);
             document.removeEventListener('mouseout', this.onDocumentMouseOutBind, false);

         },
         checkSpinAmount: function() {
             var temp = Math.abs(this.spinAmount);
             //  console.log("temp = ", temp);
             // found through trial and error
             // a quick click halts the cube because it is 0 exactly
             // setting temp to >= 0 kills the drag responsiveness
             if (temp > 0 && temp < 0.001500) {
                 this.userdown = false;
             }
             if (temp == 0) {
                 this.bump_cube_forward();
             }
         },
         get_degrees: function() {
             return ((THREE.Math.radToDeg(this.$mesh.rotation.y)) >> 0); //% 360;
         },
         bump_cube_forward: function() {
             var nowdegs = THREE.Math.radToDeg(this.$mesh.rotation.y);
             if (Math.abs(nowdegs) > 359) {
                 this.$mesh.rotation.set(0, 0, 0);
             }
             nowdegs--;
             var nextrads = THREE.Math.degToRad(nowdegs);
             this.$mesh.rotation.set(0, nextrads, 0);
         },
         destroy_stall: function() {
             this.stallCubeBool = false;
         },
         stall_cube: function() {
             this.stallCubeBool = true;

             this.viewFaceTimeout = setTimeout(function() {
                 this.bump_cube_forward();
                 this.destroy_stall();

             }.bind(this), 1500);
         },
         animate: function() {
             if (this.userdown) {
                 this.calcUserSpin();
             } else {

                 this.checkForFaces();
                 this.calcAutoSpin();
             }

             this.$renderer.render(this.$scene, this.$camera);
             requestAnimationFrame(this.animationBind);

         },
         calcUserSpin: function() {
             this.spinAmount = (this.targetRotation - this.$mesh.rotation.y) * 0.05;

             this.$mesh.rotation.y += this.spinAmount;
             this.checkSpinAmount();
         },
         calcAutoSpin: function() {
             if (!this.stallCubeBool) {
                 this.$mesh.rotation.y -= (this.speed);
                 this.targetRotation = this.$mesh.rotation.y;
             }

         },
         checkForFaces: function() {

             if (this.stallCubeBool) {
                 return;
             }


             var deg = this.get_degrees() % 360;
             deg = Math.abs(deg);




             switch (deg) {
                 case (90):
                     //Enabler.counter("showFaceOne", true);

                     broadcast_data("onNewCubeFace", 1);
                     this.stall_cube();



                     break;
                 case (180):

                     broadcast_data("onNewCubeFace", 2);
                     this.stall_cube();


                     break;
                 case (270):

                     broadcast_data("onNewCubeFace", 3);
                     this.stall_cube();


                     break;
                 case (359):

                     broadcast_data("onNewCubeFace", 4);
                     this.stall_cube();
             }
         }
     };

     return my_constructor;
 })();