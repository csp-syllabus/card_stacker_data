
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
