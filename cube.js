// kevindowd@mediaworks.co.nz
var CubeManager = (function() {
    "use strict";

    // put these in utils
    function broadcast_data(name, data) {
        // there is a polyfill for this
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

    function get_nearest(array, num) {
        var i = 0;
        var theDiff = 1000;
        var result;
        for (i in array) {
            var m = Math.abs(num - array[i]);
            if (m < theDiff) {
                theDiff = m;
                result = array[i];
            }
        }
        return result;
    }

    function cube_constructor() {
        this.$initial_first_time_delay = 2000;
        this.$speed = 3000;
        this.animationBind = this.animate.bind(this);
        this.mousemoveBind = this.mousemove.bind(this);

// mouse and touch call the onTapped event
        window.addEventListener("onTapped", this.onUserSelectedFace.bind(this), true);
        window.addEventListener("onCubeTouch", this.onTouched.bind(this), true);
        window.addEventListener("onCubeTouchEnd", this.onTouchEnd.bind(this), true);
        window.addEventListener("onCubeMouseLeave", this.onMouseLeave.bind(this), true);
        window.addEventListener("onCubeMouseEnter", this.onMouseEnter.bind(this), true);
        window.addEventListener("onImageLoaded", this.render_only.bind(this), true);
        window.addEventListener("onMouseMoveCube", this.mousemoveBind, true);




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
            set: function(o) {
                this.$renderer = o;
            }
        });

        Object.defineProperty(this, "cube_speed", {
            get: function() {
                return this.$speed;
            },
            set: function(f) {
                this.$speed = f;
            }
        });

        Object.defineProperty(this, "cube_initial_time_delay", {
            set: function(n) {
                this.$initial_first_time_delay = Math.max(0, Math.min(16000, n));
            }
        });


        Object.defineProperty(this, "start_cube_spin", {
            set: function(n) {
                if (n) {
                    this.startMainTween(this.$initial_first_time_delay, "-90", Infinity);
                    this.animate();
                }

            }
        });

        // document.addEventListener("visibilitychange", function(e) {
        //     if (document.visibilityState == "visible") {} else {
        //         if (document.visibilityState == "hidden") {}
        //     }
        // }, false);

    }
    //end constructor

    cube_constructor.prototype = {
            startMainTween: function(thedelay, theoffset, repeats) {

                if (typeof this.tweenMain === "object" && this.tweenMain._isPlaying){
                    this.killMainTween();
                }

                var deg = this.get_degrees() % 360;
                this.position = {
                    rotation: deg,
                    target: this.$mesh.rotation
                };

                this.tweenMain = new TWEEN.Tween(this.position)
                    .to({
                        rotation: theoffset
                    }, this.$speed)
                    .delay(thedelay)
                    .easing(TWEEN.Easing.Cubic.Out)
                    .repeat(repeats)
                    .repeatDelay(this.$speed)
                    .start();




                this.tweenMain.onStart(function(o) {
                   
                });
                this.tweenMain.onComplete(function(o) {
                    
                });

                this.tweenMain.onUpdate(function(o) {
                    o.target.y = THREE.Math.degToRad(o.rotation);
                });

                this.tweenMain.onStop(function(o) {
                    console.log("end main tween");
                });


                return this.tweenMain;
            },

            singletween: function(theoffset) {
                var deg = this.get_degrees() % 360;
                this.singleposition = {
                    rotation: deg,
                    target: this.$mesh.rotation
                };

                this.tweenSingle = new TWEEN.Tween(this.singleposition)
                    .to({
                        rotation: theoffset
                    }, 2000)
                    .delay(0)
                    .easing(TWEEN.Easing.Cubic.Out)
                    .repeat(0)
                    .start()

                this.tweenSingle.onComplete(function(o) {
                    this.startMainTween(1800, "-90", Infinity)
                }.bind(this));

                this.tweenSingle.onUpdate(function(o) {
                    o.target.y = THREE.Math.degToRad(o.rotation);
                });



            },

            onUserSelectedFace: function(e) {
                console.log("TAPPED +++++ ")
                var vector = new THREE.Vector3((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1, 0.5);
                vector.unproject(this.$camera);
                raycaster.set(this.$camera.position, vector.sub(this.$camera.position).normalize());
                var intersects = raycaster.intersectObject(this.$mesh);

                if (intersects.length > 0) {
                    var index = Math.floor(intersects[0].faceIndex / 2);

                    switch (index) {
                        case 0:
                            // this is image two
                            window.face_two_click();
                            break;
                        case 1:
                            // this id image four
                            window.face_four_click();
                            break;
                        case 4:
                            // this is image one
                            window.face_one_click();
                            break;
                        case 5:
                            //  this is image three
                            window.face_three_click();
                            break;
                        default:
                            // should never get here
                            window.face_one_click();

                    }
                }

            },

            render_only: function() {
                this.$mesh.rotation.set(0, 0, 0);
                this.$renderer.render(this.$scene, this.$camera);
            },
            mousemove: function() {
                // we need to update the cube when dragged
                // called from the mouse only code
                this.$renderer.render(this.$scene, this.$camera);
            },

            get_degrees: function() {
                return THREE.Math.radToDeg(this.$mesh.rotation.y) >> 0; //% 360;
            },
            get_rads: function() {
                return ((THREE.Math.degToRad(this.$mesh.rotation.y))); //% 360;
            },

            onMouseEnter: function() {},

            onMouseLeave: function() {
                this.killMainTween();
                this.single_spin();
            },

            onTouched: function(e) {
                this.killMainTween();
            },
            onTouchEnd: function(e) {
               this.killMainTween();
               this.killSingleTween();
               this.single_spin();
            },
            killMainTween() {
                 if (typeof this.tweenMain === "object" && this.tweenMain._isPlaying){
                        this.tweenMain.stop();
                 }
             
                TWEEN.removeAll();
            },
            killSingleTween() {
                 if (typeof this.tweenSingle === "object" && this.tweenSingle._isPlaying){
                     console.log("killSingleTween")
                        this.tweenSingle.stop();
                        TWEEN.removeAll();
                 }
                
            },
            single_spin: function(){
              
                var tempOffset = (this.get_degrees() % 90);
                tempOffset = (tempOffset > 0) ? tempOffset * -1 : (tempOffset + 90) * -1;
                // console.log("end touch = ", tempOffset.toString());
                var tw = this.singletween(tempOffset.toString());
            },
            animate: function() {
                this.$renderer.render(this.$scene, this.$camera);
                TWEEN.update();
                requestAnimationFrame(this.animationBind);
                //window.xxxx = requestAnimationFrame(this.animationBind);
            },


        }
        //  end proto



    return cube_constructor;
})();