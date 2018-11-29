!(function trackBackup() {
    Enabler.counter("showingBackup", true);
    console.log("%c 2. MEDIAWORKS: backup js loaded ", 'background: green; color: #FFFFFF');
})();


function showBackup() {
    var helperElement = document.querySelector(".helper");
    var container = document.querySelector(".container");
    if (!!helperElement) {
        helperElement.hidden = true;
    }
    if (!!container) {
        container.hidden = true;
    }

    var myimage = new Image();
    var myanchor = document.createElement("a");
    myanchor.setAttribute("target", "_blank");
    myanchor.setAttribute("href", "javascript:face_backup_click();");
    myanchor.appendChild(myimage);


    myimage.onload = function(e) {
        var parent = document.querySelector(".adbanner");
        if (!!parent) {
            parent.appendChild(myanchor);

        }
    };

    // feel free to edit these two
    myimage.setAttribute("class", "backup-style");
    myimage.src = Enabler.getUrl("backup.jpg");

}