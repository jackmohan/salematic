      // Disable right-click
        // window.oncontextmenu = function () {
        //     alert("Right-click is disabled.");
        //     return false;
        // };

        // Disable DevTools shortcut keys
        document.addEventListener("keydown", function (event) {
            const key = event.key || event.keyCode;

            // Block F12
            if (event.key === "F12" || event.keyCode === 123) {
                // alert("F12 is disabled.");
                event.preventDefault();
                return false;
            }


            // Block Ctrl+Shift+I and Ctrl+Shift+J
            if (event.ctrlKey && event.shiftKey && (key == 'I' || key == 'i' || key == 'J' || key == 'j')) {
                // alert("DevTools shortcut is disabled.");
                event.preventDefault();
                return false;
            }

            // Optional: Block Ctrl+U (View Source)
            if (event.ctrlKey && (key == 'U' || key == 'u')) {
                // alert("Viewing source is disabled.");
                event.preventDefault();
                return false;
            }

            // Optional: Block Ctrl+Shift+C (Inspect)
            if (event.ctrlKey && event.shiftKey && (key == 'C' || key == 'c')) {
                // alert("Inspect Element is disabled.");
                event.preventDefault();
                return false;
            }
        }, false);
       

      
 setInterval(function () {
    const before = performance.now();
    debugger;
    const after = performance.now();
    if (after - before > 200) {
        alert("DevTools was opened. Login again.");
        window.location.href = "/logout";
    }
    }, 1000);

    