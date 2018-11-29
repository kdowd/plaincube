function attach_touch_handlers(ele, cam, m) {
    window.figg = new AlloyTouch({
        touch: ele,
        touchStart: function(evt, value) {
            broadcast_event("onCubeTouch");
            Enabler.counter("DragStart", true);
        },
        touchMove: function(evt, value) {},
        touchEnd: function(evt, value) {
            console.log("touchEnd");
            broadcast_event("onCubeTouchEnd");
        },
        // change: function(value) {},

        tap: function(evt, value) {
            broadcast_event("onTapped");
            evt.preventDefault();
        },
        vertical: false,
        sensitivity: 0.6,
        bindSelf: true,
        target: mesh.rotation,
        property: "y",
        factor: 0.12,
        moveFactor: 0.016,
        inertia: false
    });
}