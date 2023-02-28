   ///start_initialize
   ///initialize variables
   var isBubble = false;
   var randomElementID =
       `ddt-${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}`
   console.log(randomElementID);
   if (!isBubble) {
       var instance = {};
       instance.data = {};
       instance.data.listcount = 0;
       instance.triggerEvent;
       instance.publishState;
       instance.data.isBubble = isBubble;
       instance.data.randomElementID = randomElementID;
       var properties = {};
       properties.data_source = [];
       instance.data.mainElement = $('#cardstack');
       console.log(instance.data.mainElement);
       $('#cardstack').after(`<div id="temp" class="invisible"></div>`);
       instance.data.temp = $('#temp');
       instance.data.slick = $('#slick');
       console.log("instance canvas", instance.data.mainElement);
   } else {
       instance.data.randomElementID = randomElementID;
       instance.canvas.append(
           `<div id="cardstack${instance.data.randomElementID}"></div> <div id="temp${instance.data.randomElementID}" class="invisible"></div>`
           );
       instance.data.mainElement = $(`#cardstack${instance.data.randomElementID}`);
       instance.data.temp = $(`#temp${instance.data.randomElementID}`);
       instance.data.isBubble = isBubble;
   }
   instance.data.handleTypingChange = (content, id) => {
       // When the typing has stopped, trigger the "stopped_typing" event and update the Quill contents
       instance.triggerEvent('stopped_typing');
       instance.data.typingTimeout = null;
       // Expose Delta as state
       instance.publishState('delta', content);
       instance.publishState('editedcard_id', id);
       instance.publishState('htmlobject', instance.data.mainElement.html());
       instance.triggerEvent('relocated');
   };
   instance.data.handleStopTyping = (content, id) => {
       // Clear the timeout and set a new one to handle the typing change
       clearTimeout(instance.data.typingTimeout);
       instance.data.typingTimeout = setTimeout(() => instance.data.handleTypingChange(JSON.stringify(content), id),
           250);
   };
   //end initialize
   ///start UPDATE
   function main() {
       //wrapped to avoid return error
       function isFocused(focused) {
           if (focused) {
               return;
           }
       }
       isFocused(instance.data.focused);
       //Make Card Stack Panel instance based for multiple instances of the plugin on a page
       instance.data.plan_unique_id = instance.data.plan_unique_id;
       //Prevent Update from running when add_new_list_item runs
       //wrapped to avoid return error
       function isHalted(halted) {
           if (halted) {
               return;
           }
       }
       isHalted(instance.data.halted);
       // HTML rerendered only when a new card is added to the plan    
       if (instance.data.listcount == instance.data.data_source_length) {
           instance.data.mainElement.addClass(`cardstackQuill`)
           $(`.cardstackQuill .ql-toolbar`).remove()
           document.querySelectorAll(".quillEditor").forEach(editor => {
               //adding the quill editor to a container
               const quill = new Quill(editor, {
                   modules: {
                       toolbar: [
                           [{
                               font: []
                           }, {
                               size: []
                           }],
                           ['bold', 'italic', 'underline', 'strike'],
                           [{
                               color: []
                           }, {
                               background: []
                           }],
                           [{
                               script: 'super'
                           }, {
                               script: 'sub'
                           }],
                           [{
                               header: '1'
                           }, {
                               header: '2'
                           }, 'blockquote', 'code-block'],
                           [{
                               list: 'ordered'
                           }, {
                               list: 'bullet'
                           }, {
                               indent: '-1'
                           }, {
                               indent: '+1'
                           }],
                           ['link', 'video'],
                           ['clean']
                       ]
                   },
                   theme: 'snow',
                   //put the element of where you want to display the editor
                   debug: 'warn',
                   bounds: editor
               });
               // Access the toolbar after the Quill editor is initialized
               const toolbar = quill.root.parentElement.previousSibling
               // Set the toolbar to be hidden by default   
               toolbar.setAttribute('hidden', true)
               quill.root.parentElement.style.borderTop = `1px`;
               // Show the toolbar when the Quill editor is focused
               quill.root.addEventListener('focus', e => {
                   instance.data.focused = true
                   toolbar.removeAttribute('hidden', false)
               })
               quill.root.addEventListener('click', e => {})
               /*   // Hide the toolbar when the Quill editor loses focus,
                  // but only if the element that was clicked is not a child of the toolbar - courtesy of chatGPT
                  quill.root.addEventListener('blur', e => {
                
                    instance.data.focused = false

                   if (!toolbar.contains(e.relatedTarget)) {
                      toolbar.setAttribute('hidden', true)
                    } 
                      
                      
                  }) */
               quill.root.addEventListener('blur', e => {
                   instance.data.focused = false;
                   const tooltip = e.find('.ql-tooltip');
                   const tooltipStyle = window.getComputedStyle(tooltip);
                   console.log('blur');
                   if (!toolbar.contains(e.relatedTarget) && tooltipStyle.display === 'none') {
                       toolbar.setAttribute('hidden', true);
                       const toolbars = document.querySelectorAll('.toolbar');
                       toolbars.forEach(toolbar => {
                           toolbar.setAttribute('hidden', true);
                       });
                   }
               });
               quill.on('editor-change', (eventName, ...args) => {
                   // Listen for changes to the editor
                   //eventName options =
                   if (eventName === 'text-change') {
                       // If the text has changed, set a timeout to handle the change for performance
                       instance.data.handleStopTyping(quill.getContents(), editor.id);
                   } else if (eventName === 'selection-change') {
                       // Handle selection change
                   }
               });
           })
           // return;
       }
       //console.log(properties.type_of_items_type.listProperties()); Returns all accessible properties
       //Checking and setting the html 
       instance.data.cardsList = '';
       if (instance.data.htmlField) {
           instance.data.cardsList = instance.data.htmlField
           instance.data.mainElement.html(instance.data.cardsList)
           //Calling the Nested Sortable library on the pre-existing HTML
           instance.data.ns = $('ol.sortable#' + instance.data.plan_unique_id).nestedSortable({
               forcePlaceholderSize: true,
               handle: '.dragHandle',
               helper: 'clone',
               items: 'li',
               opacity: .6,
               placeholder: 'placeholder',
               revert: 250,
               tabSize: 25,
               tolerance: 'pointer',
               toleranceElement: '> div',
               maxLevels: 4,
               isTree: true,
               expandOnHover: 700,
               startCollapsed: true,
               change: function() {
                   //console.log('Relocated item')
               },
               relocate: function() {
                   //console.log('relocate');
                   setTimeout(function() {
                       instance.publishState("htmlobject", instance.data.mainElement.html());
                       instance.triggerEvent("relocated");
                   }, 10);
               }
           });
           instance.data.listcount = instance.data.data_source_length;
       } else {
           //console.log(instance.data.cardsList)}
           //retrieve the list of snippets from the app
           if (instance.data.data_source_length > 0) {
               instance.data.attplansnippets = instance.data.attplansnippetsLoad;
               //console.log(instance.data.attplansnippets[0].get("description_text"));
               instance.data.cardElement = $("")
               // A nested function is made which creates the markup of an attribute plan snippet
               var generateListItemHtml = (attributeplansnippet) => {
                   //generate a div that contains the menu section, and all elements within it are divs in a flex group. Stlying is applied via the add to header section of the plugin editor
                   let newListElement = '<li style="display: list-item;" class="mjs-nestedSortable-leaf" id="' +
                       attributeplansnippet._id +
                       '" data-foo="bar"><div class = "parentContainer highlightable highlight-' +
                       attributeplansnippet['Attribute ID'] + '" id="' + attributeplansnippet['Attribute ID'] +
                       '"><div class = "dragContainer"><span class="dragHandle material-icons">drag_indicator</span></div><div class="contentContainer"><div class ="menuContainer"><span title="Click to show/hide children" class="disclose ui-icon ui-icon-minusthick"><span></span></span><span title="Click to show/hide description" data-id="' +
                       attributeplansnippet._id +
                       '" class = "expandEditor material-icons" >expand_more</span><input  type="text" class = "itemTitle" data-id="' +
                       attributeplansnippet._id + '" value="' + attributeplansnippet['Attribute Name'] +
                       '"><span class="deleteMenu material-icons" title="Click to delete item." data-id="' +
                       attributeplansnippet._id + '">close</span></div><div class = "quillContainer" id="' +
                       attributeplansnippet._id + '"><div class="quillEditor" id="' + attributeplansnippet._id +
                       '"></div></div></div></div></li>'
                   //"attribute_id_text"
                   return newListElement
               }
               // Looping through all the attribute plan snippets and creating their markup     
               for (let i = 0; i < instance.data.data_source_length; i++) {
                   console.log(instance.data.attplansnippets[i]);
                   instance.data.cardsList += generateListItemHtml(instance.data.attplansnippets[i]);
               }
           }
           console.log("cardsList", instance.data.cardsList);
           instance.data.temp.html(instance.data.cardsList)
           //Dropping the entire markup inside an <ol> with class sortable for Nested Sortable      
           let data = `<ol id="` + instance.data.plan_unique_id +
               `" class="sortable ui-sortable mjs-nestedSortable-branch mjs-nestedSortable-expanded">` + instance.data
               .cardsList + "</ol>";
           //Calling nestedSortable on newly created markup    
           instance.data.mainElement.html(data)
           //instance.data.quillinstances = [];
           $(".ql-toolbar").remove()
           document.querySelectorAll(".quillEditor").forEach(editor => {
               //console.log("loop");
               //adding the quill editor to a container
               const quill = new Quill(editor, {
                   modules: {
                       toolbar: [
                           [{
                               font: []
                           }, {
                               size: []
                           }],
                           ['bold', 'italic', 'underline', 'strike'],
                           [{
                               color: []
                           }, {
                               background: []
                           }],
                           [{
                               script: 'super'
                           }, {
                               script: 'sub'
                           }],
                           [{
                               header: '1'
                           }, {
                               header: '2'
                           }, 'blockquote', 'code-block'],
                           [{
                               list: 'ordered'
                           }, {
                               list: 'bullet'
                           }, {
                               indent: '-1'
                           }, {
                               indent: '+1'
                           }],
                           ['link', 'video'],
                           ['clean']
                       ]
                   },
                   theme: 'snow',
                   //put the element of where you want to display the editor
                   debug: 'warn',
                   bounds: editor
               });
               // Access the toolbar after the Quill editor is initialized
               const toolbar = quill.root.parentElement.previousSibling
               // Set the toolbar to be hidden by default
               toolbar.setAttribute('hidden', true)
               //console.log(quill.root)
               quill.root.parentElement.style.borderTop = `1px`;
               // Show the toolbar when the Quill editor is focused
               quill.root.addEventListener('focus', e => {
                   //console.log('focused')
                   instance.data.focused = true
                   toolbar.removeAttribute('hidden', false)
               })
               quill.root.addEventListener('click', e => {
                   //console.log("it's clicked")
               })
               // Hide the toolbar when the Quill editor loses focus,
               // but only if the element that was clicked is not a child of the toolbar - courtesy of chatGPT
               quill.root.addEventListener('blur', e => {
                   //console.log('unfocused')
                   instance.data.focused = false
                   if (!toolbar.contains(e.relatedTarget)) {
                       toolbar.setAttribute('hidden', true)
                   }
               })
               //console.log(toolbar)
               quill.on('editor-change', (eventName, ...args) => {
                   // Listen for changes to the editor
                   //eventName options =
                   //console.log('editor-change');
                   if (eventName === 'text-change') {
                       // If the text has changed, set a timeout to handle the change for performance
                       instance.data.handleStopTyping(quill.getContents(), editor.id);
                   } else if (eventName === 'selection-change') {
                       // Handle selection change
                   }
               });
           })
           instance.data.ns = $('ol.sortable#' + instance.data.plan_unique_id).nestedSortable({
               forcePlaceholderSize: true,
               handle: '.dragHandle',
               helper: 'clone',
               items: 'li',
               opacity: .6,
               placeholder: 'placeholder',
               revert: 250,
               tabSize: 25,
               tolerance: 'pointer',
               toleranceElement: '> div',
               maxLevels: 4,
               isTree: true,
               expandOnHover: 700,
               startCollapsed: true,
               change: function() {
                   //console.log('Relocated item')
               },
               relocate: function() {
                   //console.log('relocate');
                   setTimeout(function() {
                       instance.publishState("htmlobject", instance.data.mainElement.html());
                       instance.triggerEvent("relocated");
                   }, 10);
               }
           });
       }
       // Delete, Fold and Expand/Colapse functions 
       $('.disclose').on('click', function() {
           $(this).closest('li').toggleClass('mjs-nestedSortable-collapsed').toggleClass(
               'mjs-nestedSortable-expanded');
           $(this).toggleClass('ui-icon-plusthick').toggleClass('ui-icon-minusthick');
       });
       $('.deleteMenu').unbind();
       $('.deleteMenu').click(function() {
           let uniqueId = $(this).attr('data-id');
           if ($('#' + uniqueId).length == 0) {
               return;
           }
           if (window.confirm("Are you sure you want to delete this card ?")) {
               let childCardsIdList = $('#' + uniqueId).find('li');
               let idArray = [];
               childCardsIdList.each(function(index) {
                   idArray.push($(this).attr('id'));
               });
               instance.publishState("htmlobject", instance.data.mainElement.html());
               $('#' + uniqueId).remove();
               setTimeout(function() {
                   instance.publishState("htmlobject", instance.data.mainElement.html());
                   instance.triggerEvent("relocated");
               }, 10);
               setTimeout(function() {
                   instance.publishState("deletedcard_id", uniqueId);
                   instance.publishState("deletedchildren_id_list", idArray.toString());
                   instance.triggerEvent("deleted");
               }, 10);
           }
       });
       $('#serialize').click(function() {
           serialized = $('ol.sortable').nestedSortable('serialize');
           $('#serializeOutput').text(serialized + '\n\n');
       })
       $('#toHierarchy').click(function(e) {
           hiered = $('ol.sortable').nestedSortable('toHierarchy', {
               startDepthCount: 0
           });
           hiered = dump(hiered);
           (typeof($('#toHierarchyOutput')[0].textContent) != 'undefined') ? $('#toHierarchyOutput')[0]
               .textContent = hiered: $('#toHierarchyOutput')[0].innerText = hiered;
       })
       $('#toArray').click(function(e) {
           arraied = $('ol.sortable').nestedSortable('toArray', {
               startDepthCount: 0
           });
           arraied = dump(arraied);
           (typeof($('#toArrayOutput')[0].textContent) != 'undefined') ? $('#toArrayOutput')[0].textContent =
               arraied: $('#toArrayOutput')[0].innerText = arraied;
       });
       $('.expandEditor').click(function() {
           var uniqueId = $(this).attr('data-id');
           $('#' + uniqueId + '.quillEditor').toggle('fast', 'swing');
           if ($('.expandEditor[data-id=' + uniqueId + ']').html() === 'expand_more') {
               $('.expandEditor[data-id=' + uniqueId + ']').html('expand_less');
           } else {
               $('.expandEditor[data-id=' + uniqueId + ']').html('expand_more');
           }
       });
       instance.data.listcount = instance.data.data_source_length;
       $(".itemTitle").on("input", function() {
           let editedCardId = $(this).attr('data-id');
           instance.publishState("changedname", $(this).val());
           instance.triggerEvent("namechange");
           instance.publishState("editedcard_id", editedCardId);
       });
       //end update
       window.CSP = instance;
   }
   ///load function
   function buildSnippetData(DAS, DASV, TOAS, TOASV) {
    instance.data.snippetsDataMerged = [];
    DAS.forEach(function(item, index) {
        var newItem = {};
        newItem['Type'] = 'DAS';
        newItem['Attribute'] = item['Attribute'];
        newItem['x'] = item['X Coordinate'];
        newItem['y'] = item['Y Coordinate'];
        newItem['Box Height'] = item['Box Height'];
        newItem['Box Width'] = item['Box Width'];
        newItem['Account Webpage'] = item['Account Webpage'];
        newItem['_id'] = item['_id'];
        newItem['Volume'] = DASV[index];
        instance.data.snippetsDataMerged.push(newItem);
    });
    TOAS.forEach(function(item, index) {
        var newItem = {};
        newItem['Type'] = 'TOAS';
        newItem['Attribute'] = item['Attribute'];
        newItem['Text'] = item['Text Snippet '];
        newItem['Account Webpage'] = item['Webpage'];
        newItem['_id'] = item['_id'];
        newItem['Volume'] = TOASV[index];
        instance.data.snippetsDataMerged.push(newItem);
    });
    console.log(instance.data.snippetsDataMerged);
}
   function onDataLoaded() {
       window.CSP = instance;
       console.log("results", instance.data.result, "instance.data.APS_result", instance.data.APS_result);
       ///update variables
       properties.data_source = instance.data.APS_result;
       console.log(instance.data.result['APS'], instance.data.result.APS, properties.data_source);
       properties.type_of_items = '';
       properties.plan_unique_id = instance.data.result.Plan['_id'];
       properties.html_field = instance.data.result.Plan['JQTree HTML'];
       properties.type_of_items_type = {};
       instance.data.data_source_length = instance.data.APS_result.length;

       
       buildSnippetData(instance.data.result['DAS'], instance.data.result['DAS_AW_Volume'], instance.data.result[
           'TOAS'], instance.data.result['TOAS_AW_Volume']);
       instance.data.attplansnippetsLoad = instance.data.result['APS'];
       instance.data.attplansnippetsLoad.forEach(function(item, index) {
        let array = instance.data.snippetsDataMerged.filter(function(obj) {
            //console.log(obj,item['Attribute']);
            return obj.Attribute === item['Attribute'];
        });
        item['snippets'] = array;
    });

       console.log("main-ondataloaded");
       main();
   }
   //get data
   if (!instance.data.isBubble) {
       console.log("!isBubble");
       var planId = '1677018933790x637390419526680600';
       //
       instance.data.getAPS = function(plan) {
           // Create a form data object
           let bodyContent = new FormData();
           bodyContent.append("plan_id", plan);
           let headersList = {
               "Accept": "*/*",
           };
           // Fetch the data from the API endpoint using POST method
           console.log("fetchstarting");
           fetch(`https://d110.bubble.is/site/proresults/version-chris-sprint-38-feb-23/api/1.1/wf/get_aps`, {
               method: "POST",
               body: bodyContent,
               headers: headersList
           }).then(response => response.json()).then(result => {
               console.log("response", result.response);
               instance.data.result = result.response;
               instance.data.APS_result = result.response.APS;
               onDataLoaded();
               return result
           }).catch(error => {
               console.log("error", error);
               throw error
           });
       }
       //
       instance.data.properties = properties;
       instance.data.getAPS(planId);
   }
   if (instance.data.isBubble) {
       instance.data.data_source_length = properties.data_source.length();
       instance.data.plan_unique_id = properties.plan_unique_id;
       //instance.data.attplansnippetsLoad = properties.data_source.get(0, instance.data.data_source_length);
       instance.data.snippetsTransform = properties.data_source.get(0, properties.data_source.length());
       let snippetsData = instance.data.snippetsTransform[0].listProperties();
       console.log("snippetsTransform", instance.data.snippetsTransform, "snippetsData", snippetsData);
       instance.data.attplansnippetsLoad = [];
       instance.data.snippetsTransform.forEach(function(item, index) {
           var newItem = {};
           snippetsData.forEach((value) => {
               var keyNew = value.replace('_api_c2_', '');
               newItem[keyNew] = item.get(value);
               console.log("newItem", newItem, "keynew", keyNew, "value", value);
           });
           instance.data.attplansnippetsLoad.push(newItem);
       });
   }
   console.log("bubblesnippetsArray", instance.data.attplansnippetsLoad);
   buildSnippetData();
   instance.data.htmlField = properties.html_field;
   console.log("main-isBubble");
   ///start me up
   main();
   // end load data
   //end update
   //start expand collapse
   if (instance.data.isBubble) {
       instance.data.expand = properties.expand;
   }
   if (instance.data.expand) {
       $('.quillEditor:hidden').toggle('fast', 'swing');
       $('.expandEditor').html("expand_less");
   } else {
       $('.quillEditor:visible').toggle('fast', 'swing');
       $('.expandEditor').html("expand_more");
   }
   //end expand collapse
   //start add_new_list_item
   //check if the data exists
   if (properties.attribute_plan_snippet) {
       // Declaring newListElement function to create markup of a newly added card
       var generateListItemHtml = (attributeplansnippet) => {
           let newListElement = '<li style="display: list-item;" class="mjs-nestedSortable-leaf" id="' +
               attributeplansnippet.get("_id") +
               '" data-foo="bar"><div class = "parentContainer highlightable highlight-' + attributeplansnippet.get(
                   "attribute_id_text") + '" id="' + attributeplansnippet.get("attribute_id_text") +
               '"><div class = "dragContainer"><span class="dragHandle material-icons">drag_indicator</span></div><div class="contentContainer"><div class ="menuContainer"><span title="Click to show/hide children" class="disclose ui-icon ui-icon-minusthick"><span></span></span><span title="Click to show/hide description" data-id="' +
               attributeplansnippet.get("_id") +
               '" class = "expandEditor material-icons" >expand_more</span><input  type="text" class = "itemTitle" data-id="' +
               attributeplansnippet.get("_id") + '"value="' + attributeplansnippet.get("attribute_name_text") +
               '"><span class="deleteMenu material-icons" title="Click to delete item." data-id="' +
               attributeplansnippet.get("_id") + '">close</span></div><div class = "quillContainer" id="' +
               attributeplansnippet.get("_id") + '"><div class="quillEditor" id="' + attributeplansnippet.get(
               "_id") + '"></div></div></div></div></li>';
           return newListElement;
       }
       //instance.data.quillinstances.push(quill)    
       console.log(properties.attribute_plan_snippet.listProperties());
       console.log(properties.attribute_plan_snippet.get('attribute_custom_attribute'));
       //pass the attribute_plan_snippet to a function to generate it's li item
       let itemHtml = generateListItemHtml(properties.attribute_plan_snippet)
       //Select the existing cardstack element
       let cardStackElement = $('#' + instance.data.plan_unique_id)
       //Append the new li item to the existing cardstack
       cardStackElement.append(itemHtml)
       //Call nestedSortable again(as in update)
       instance.data.ns = $('#' + instance.data.plan_unique_id).nestedSortable({
           forcePlaceholderSize: true,
           handle: '.dragHandle',
           helper: 'clone',
           items: 'li',
           opacity: .6,
           placeholder: 'placeholder',
           revert: 250,
           tabSize: 25,
           tolerance: 'pointer',
           toleranceElement: '> div',
           maxLevels: 4,
           isTree: true,
           expandOnHover: 700,
           startCollapsed: true,
           change: function() {
               //console.log('Relocated item')
           },
           relocate: function() {
               //console.log('add New');
               setTimeout(function() {
                   instance.publishState("htmlobject", instance.canvas.html());
                   instance.triggerEvent("relocated");
               }, 100);
           }
       });
       $(".ql-toolbar").remove()
       document.querySelectorAll(".quillEditor").forEach(editor => {
           // console.log("loopadd");
           //adding the quill editor to a container
           const quill = new Quill(editor, {
               modules: {
                   toolbar: [
                       [{
                           font: []
                       }, {
                           size: []
                       }],
                       ['bold', 'italic', 'underline', 'strike'],
                       [{
                           color: []
                       }, {
                           background: []
                       }],
                       [{
                           script: 'super'
                       }, {
                           script: 'sub'
                       }],
                       [{
                           header: '1'
                       }, {
                           header: '2'
                       }, 'blockquote', 'code-block'],
                       [{
                           list: 'ordered'
                       }, {
                           list: 'bullet'
                       }, {
                           indent: '-1'
                       }, {
                           indent: '+1'
                       }],
                       ['link', 'video'],
                       ['clean']
                   ]
               },
               theme: 'snow',
               //put the element of where you want to display the editor
               debug: 'warn',
               bounds: editor
           });
           // Access the toolbar after the Quill editor is initialized
           const toolbar = quill.root.parentElement.previousSibling
           // Set the toolbar to be hidden by default
           toolbar.setAttribute('hidden', true)
           //console.log(quill.root)
           quill.root.parentElement.style.borderTop = `1px`;
           // Show the toolbar when the Quill editor is focused
           quill.root.addEventListener('focus', e => {
               //console.log('focused')
               instance.data.focused = true
               toolbar.removeAttribute('hidden', false)
           })
           quill.root.addEventListener('click', e => {
               //console.log("it's clicked")
           })
           // Hide the toolbar when the Quill editor loses focus,
           // but only if the element that was clicked is not a child of the toolbar - courtesy of chatGPT
           quill.root.addEventListener('blur', e => {
               //console.log('unfocused')
               instance.data.focused = false
               if (!toolbar.contains(e.relatedTarget)) {
                   toolbar.setAttribute('hidden', true)
               }
           })
           // console.log(toolbar)
           quill.on('editor-change', (eventName, ...args) => {
               // Listen for changes to the editor
               //eventName options =
               //console.log('editor-change');
               if (eventName === 'text-change') {
                   // If the text has changed, set a timeout to handle the change for performance
                   instance.data.handleStopTyping(quill.getContents(), editor.id);
                   //console.log(quill.getContents());
               } else if (eventName === 'selection-change') {
                   // Handle selection change
               }
           });
       })
       // Delete, Fold and Expand/Colapse functions 
       $('.disclose').on('click', function() {
           $(this).closest('li').toggleClass('mjs-nestedSortable-collapsed').toggleClass(
               'mjs-nestedSortable-expanded');
           $(this).toggleClass('ui-icon-plusthick').toggleClass('ui-icon-minusthick');
       });
       $('.deleteMenu').unbind();
       $('.deleteMenu').click(function() {
           let uniqueId = $(this).attr('data-id');
           if ($('#' + uniqueId).length == 0) {
               return;
           }
           if (window.confirm("Are you sure you want to delete this card ?")) {
               let childCardsIdList = $('#' + uniqueId).find('li'); //.attr('id');
               var idArray = [];
               childCardsIdList.each(function(index) {
                   var id = $(this).attr('id');
                   idArray.push(id);
               });
               //console.log('list' + idArray.toString());
               instance.publishState("htmlobject", instance.canvas.html());
               $('#' + uniqueId).remove();
               setTimeout(function() {
                   instance.publishState("htmlobject", instance.canvas.html());
                   instance.triggerEvent("relocated");
               }, 10);
               setTimeout(function() {
                   instance.publishState("deletedcard_id", uniqueId);
                   instance.publishState("deletedchildren_id_list", idArray.toString());
                   instance.triggerEvent("deleted");
               }, 10);
           }
       });
       $('#serialize').click(function() {
           serialized = $('ol.sortable').nestedSortable('serialize');
           $('#serializeOutput').text(serialized + '\n\n');
       })
       $('#toHierarchy').click(function(e) {
           hiered = $('ol.sortable').nestedSortable('toHierarchy', {
               startDepthCount: 0
           });
           hiered = dump(hiered);
           (typeof($('#toHierarchyOutput')[0].textContent) != 'undefined') ? $('#toHierarchyOutput')[0]
               .textContent = hiered: $('#toHierarchyOutput')[0].innerText = hiered;
       })
       $('#toArray').click(function(e) {
           arraied = $('ol.sortable').nestedSortable('toArray', {
               startDepthCount: 0
           });
           arraied = dump(arraied);
           (typeof($('#toArrayOutput')[0].textContent) != 'undefined') ? $('#toArrayOutput')[0].textContent =
               arraied: $('#toArrayOutput')[0].innerText = arraied;
       });
       $('.expandEditor').unbind();
       $('.expandEditor').click(function() {
           var uniqueId = $(this).attr('data-id');
           $('#' + uniqueId + '.quillEditor').toggle('fast', 'swing');
           if ($('.expandEditor[data-id=' + uniqueId + ']').html() === 'expand_more') {
               $('.expandEditor[data-id=' + uniqueId + ']').html('expand_less');
           } else {
               $('.expandEditor[data-id=' + uniqueId + ']').html('expand_more');
           }
       });
       //console.log('add new');
       setTimeout(function() {
           instance.publishState("htmlobject", instance.canvas.html());
           instance.triggerEvent("relocated");
       }, 100);
   }
   $(".itemTitle").on("input", function() {
       let editedCardId = $(this).attr('data-id');
       instance.publishState("changedname", $(this).val());
       instance.triggerEvent("namechange");
       instance.publishState("editedcard_id", editedCardId);
   });
   //end add_new_list_item
   window.CSP = instance;