
  var chris = true;
  function loadJS(FILE_URL, async = true) {
    let scriptEle = document.createElement("script");
  
    scriptEle.setAttribute("src", FILE_URL);
    scriptEle.setAttribute("type", "text/javascript");
    scriptEle.setAttribute("async", async);
  
    document.body.appendChild(scriptEle);
  
    // success event 
    scriptEle.addEventListener("load", () => {
      console.log("File loaded")
    });
     // error event
    scriptEle.addEventListener("error", (ev) => {
      console.log("Error on loading file", ev);
    });
  }
  window.onload = function() {
    if (window.jQuery) {  
        // jQuery is loaded  
        alert("Yeah!");
    } else {
        // jQuery is not loaded
        alert("Doesn't Work");
    }
}

 /*  

 //<script src="https://code.jquery.com/ui/1.10.4/jquery-ui.min.js"></script>
<link rel="stylesheet" href="https://dd7tel2830j4w.cloudfront.net/f1669647901984x476989271686958140/JQuery-UI.css"/>
<script src = "https://dd7tel2830j4w.cloudfront.net/f1669647739015x578154305853939600/jquery.mjs.nestedSortable.js"></script>
   instance.data.listcount = 0;
   	
        instance.data.handleTypingChange = (content, id) => {
          // When the typing has stopped, trigger the "stopped_typing" event and update the Quill contents
          instance.triggerEvent('stopped_typing');
          instance.data.typingTimeout = null;

          // Expose Delta as state
          instance.publishState('delta', content);
          instance.publishState('editedcard_id', id);
          instance.publishState('htmlobject', instance.canvas.html());
          instance.triggerEvent('relocated');
        };

        instance.data.handleStopTyping = (content, id) => {
          // Clear the timeout and set a new one to handle the typing change
          clearTimeout(instance.data.typingTimeout);
          instance.data.typingTimeout = setTimeout(() => instance.data.handleTypingChange(JSON.stringify(content), id), 250);
        };
*/