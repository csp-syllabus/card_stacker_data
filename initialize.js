     //start initialize
     var isBubble = false;
     var randomElementID =
         `ddt-${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}`
     if (!isBubble) {
         var instance = {};
         instance.data = {};
         instance.data.start = true;
         instance.data.halt = false;
         instance.data.listcount = 0;
         instance.data.logging = true;
         instance.triggerEvent = (a) => {
             console.log("triggerevent", a);
         };;
         instance.publishState = (a, b) => {
             console.log("publishState", a, b);
         };
         instance.data.isBubble = false;
         instance.data.randomElementID = randomElementID;
         var properties = {};
         properties.data_source = [];
         instance.data.mainElement = $('#cardstack');
         instance.data.mainElement.append(`<div id="temp" class="invisible"></div>`);
         instance.data.temp = $('#temp');
         instance.canvas = $('#cardstack');
         instance.data.logging ? console.log("instance canvas", instance.data.mainElement) : null;
     } else {
         instance.data.start = true;
         instance.data.halt = false;
         instance.data.logging = true;
         instance.canvas.append(
             `<div id="cardstack${instance.data.randomElementID}"></div> <div id="temp${instance.data.randomElementID}" class="invisible"></div>`
             );
         instance.data.mainElement = $(`#cardstack${instance.data.randomElementID}`);
         instance.data.temp = $(`#temp${instance.data.randomElementID}`);
         instance.data.isBubble = true;
     }
     ///end CSP initialize
     instance.data.listcount = 0;
     instance.data.handleTypingChange = (editor) => {
         // When the typing has stopped, trigger the "stopped_typing" event and update the Quill contents
         let content = JSON.stringify(editor.innerHTML);
         instance.data.logging ? console.log('stopped_typing', content, editor.id) : null;
         instance.triggerEvent('stopped_typing');
         instance.data.typingTimeout = null;
         // Expose Delta as state
         instance.publishState('delta', content);
         instance.publishState('editedcard_id', editor.id);
         instance.publishState('htmlobject', instance.canvas.html());
         instance.publishState('quill_editor_content', content.substring(1, content.length - 1));
         instance.triggerEvent('relocated');
     };
     instance.data.handleStopTyping = (editor) => {
         // Clear the timeout and set a new one to handle the typing change
         //console.log('handle stopped_typing',editor.innerHTML,editor.id);
         clearTimeout(instance.data.typingTimeout);
         instance.data.typingTimeout = setTimeout(() => instance.data.handleTypingChange(editor), 250);
     };
     instance.data.generateListItemHtml = (attributeplansnippet) => {
         let aps = attributeplansnippet._id;
         let aps_att_id_text = attributeplansnippet.attribute_id_text;
         let aps_name_text = attributeplansnippet.attribute_name_text;
         //QUESTION HERE
         let aps_quill_text = attributeplansnippet.quill_description_text ? attributeplansnippet
             .quill_description_text : "";
         if (aps_quill_text === "null") {
             aps_quill_text = "";
         }
         //let aps_quill_text = "quill_description_text Placeholder";
         instance.data.logging ? console.log(
             'GenerateListItem Declared,aps, aps_id_text, aps_name_text, aps_quill_text', aps, aps_att_id_text,
             aps_name_text, aps_quill_text) : null;
         let cardItemHtml = `<li id="menuItem_${aps}" style="display: list-item;" class="mjs-nestedSortable-leaf" data-foo="bar">
 <div class = "parentContainer highlightable highlight-${aps_att_id_text}" id="${aps_att_id_text}"><div class = "dragContainer">
 <span class="dragHandle material-icons">drag_indicator</span></div><div class="contentContainer">
 <div class ="menuContainer"><span title="Click to show/hide children" class="disclose ui-icon ui-icon-minusthick"><span></span>
 </span><span title="Click to show/hide description" data-id="${aps}" class = "expandEditor material-icons" >expand_more</span>
 <input  type="text" class = "itemTitle" data-id="${aps}"value="${aps_name_text}"><span class="deleteMenu material-icons" title="Click to delete item." 
 data-id="${aps}">close</span></div><div class = "quillContainer" id="${aps}"><div class="quillEditor" id="${aps}">${aps_quill_text}</div></div>
 <div id="slider-aps-${aps}"></div></div></div></li>`;
         //console.log("Quill Description Text" + attributeplansnippet.get("description_text"));
         //console.log(cardItemHtml);
         return cardItemHtml;
     }
     instance.data.callNestedSortable = () => {
         instance.data.logging ? console.log('ANLI NestedSortable Declared') : null;
         instance.data.ns = $('ol.sortable#' + instance.data.plan_unique_id).nestedSortable({
             forcePlaceholderSize: true,
             handle: '.dragHandle',
             helper: 'clone',
             items: 'li',
             opacity: 0.6,
             placeholder: 'placeholder',
             revert: 250,
             tabSize: 25,
             tolerance: 'pointer',
             toleranceElement: '> div',
             maxLevels: 4,
             isTree: true,
             expandOnHover: 700,
             startCollapsed: false,
             change: function() {
                 instance.data.logging ? console.log('Relocated item') : null;
             },
             relocate: function() {
                 instance.data.logging ? console.log('relocate') : null;
                 instance.publishState("htmlobject", instance.canvas.html());
                 instance.triggerEvent("relocated");
                 setTimeout(instance.data.hierarchy, 100);
             }
         });
     }
     instance.data.hierarchy = () => {
         instance.data.logging ? console.log('toHierarchy Declared') : null;
         //CSP Add
         //super dumb but seems to require it to be added first
         instance.data.callNestedSortable()
         //CSP End
         let hierarchyContent = instance.canvas.find('ol.sortable').nestedSortable('toHierarchy', {
             startDepthCount: 0
         });
         setTimeout(function() {
             instance.publishState("hierarchycontent", JSON.stringify(hierarchyContent));
             instance.triggerEvent("relocated");
         }, 100);
         //save hierarchyContent object to the Plan
     }
     instance.data.dataPrepper = (typeArray, propArray, finishArray, volume) => {
         typeArray.forEach(function(item, index) {
             var newItem = {};
             propArray.forEach((value) => {
                 var keyNew = value.replace('_api_c2_', '');
                 newItem[keyNew] = item.get(value);
             });
             if (volume) {
                 newItem['volume'] = volume[index];
             }
             finishArray.push(newItem);
         });
         //console.log("FA",JSON.stringify(finishArray));
     }
     instance.data.addDASTOAS = (DAS, TOAS, DASArray, TOASArray, DASV, TOASV, APS, APSArray) => {
         instance.data.logging ? console.log("Begin-DAS, TOAS, DASArray, TOASArray, DASV, TOASV, APS, APSArray", DAS,
             TOAS, DASArray, TOASArray, DASV, TOASV, APS, APSArray) : null;
         if (DAS.length != 0) {
             instance.data.dataPrepper(DAS, instance.data.DASProperties, DASArray, DASV);
         }
         if (TOAS.length != 0) {
             instance.data.dataPrepper(TOAS, instance.data.TOASProperties, TOASArray, TOASV);
         }
         instance.data.dataPrepper(APS, instance.data.APSProperties, APSArray);
         //combine TOAS and DAS
         instance.data.DASTOAS = [];
         const DASprops = ['box_height_number', 'box_width_number', 'initial_drawn_scale_number',
             'mobile_screenshot_custom_webpage_screenshot', 'x_coordinate_number', 'y_coordinate_number', '_id'
         ];
         const TOASprops = ['text_snippet__text', '_id'];
         if (DAS.length != 0) {
             DASArray.forEach((value) => {
                 var newItem = {};
                 newItem['type'] = 'image';
                 DASprops.forEach((att) => {
                     newItem[att] = value[att];
                 });
                 //required as looping function just wouldn't work
                 newItem['webpage'] = value['account_webpage_custom_account_webpage'].get('_id');
                 newItem['attribute_id'] = value['attribute_custom_attribute'].get('_id');
                 newItem['attribute_name'] = value['attribute_custom_attribute'].get('name_text');
                 //newItem['webpage_screenshot_custom_webpage_screenshot'] = value['attribute_custom_attribute'].get('webpage_screenshot_custom_webpage_screenshot');
                 newItem['webpage_screenshot_custom_webpage_screenshot'] = 'https://via.placeholder.com/150';
                 instance.data.DASTOAS.push(newItem);
             });
         }
         instance.data.logging ? console.log("DAS -instance.data.DASTOAS", instance.data.DASTOAS) : null;
         //could be combined with above
         if (TOAS.length != 0) {
             TOASArray.forEach((value) => {
                 var newItem = {};
                 newItem['type'] = 'text';
                 TOASprops.forEach((att) => {
                     newItem[att] = value[att];
                 });
                 //required as looping function just wouldn't work
                 newItem['webpage'] = value['attribute_custom_attribute'].get('_id');
                 newItem['attribute_id'] = value['attribute_custom_attribute'].get('_id');
                 newItem['attribute_name'] = value['attribute_custom_attribute'].get('name_text');
                 instance.data.DASTOAS.push(newItem);
             });
         }
         instance.data.logging ? console.log("TOAS-instance.data.DASTOAS", instance.data.DASTOAS) : null;
         //add dastoas to APS data    
         APSArray.forEach((aps) => {
             //console.log("Start array filter");
             const matchingObjs = instance.data.DASTOAS.filter((dastoas) => dastoas.attribute_id === aps
                 .attribute_id_text);
             if (matchingObjs.length > 0) {
                 aps.DASTOAS = matchingObjs;
             }
         });
         instance.data.logging ? console.log("End-DAS, TOAS, DASArray, TOASArray, DASV, TOASV, APS, APSArray", DAS,
             TOAS, DASArray, TOASArray, DASV, TOASV, APS, APSArray) : null;
     }
     instance.data.dataPrepperAPI = (typeArray, propArray, finishArray, volume) => {
         typeArray.forEach(function(item, index) {
             var newItem = {};
             propArray.forEach((value) => {
                 var keyNew = value.replace('_api_c2_', '');
                 newItem[keyNew] = item[value];
             });
             if (volume) {
                 newItem['volume'] = volume[index];
             }
             finishArray.push(newItem);
         });
         //console.log("FA",JSON.stringify(finishArray));
     }
     instance.data.addDASTOASAPI = (DAS, TOAS, DASArray, TOASArray, DASV, TOASV, APS, APSArray) => {
         instance.data.logging ? console.log("Begin-DAS, TOAS, DASArray, TOASArray, DASV, TOASV, APS, APSArray", DAS,
             TOAS, DASArray, TOASArray, DASV, TOASV, APS, APSArray) : null;
         if (DAS.length != 0) {
             instance.data.dataPrepperAPI(DAS, instance.data.DASProperties, DASArray, DASV);
         }
         if (TOAS.length != 0) {
             instance.data.dataPrepperAPI(TOAS, instance.data.TOASProperties, TOASArray, TOASV);
         }
         instance.data.dataPrepperAPI(APS, instance.data.APSProperties, APSArray);
         //combine TOAS and DAS
         instance.data.DASTOAS = [];
         if (DAS.length != 0) {
             DASArray.forEach((value) => {
                 var newItem = {};
                 newItem['type'] = 'image';
                 instance.data.DASProperties.forEach((att) => {
                     newItem[att] = value[att];
                 });
                 //required as looping function just wouldn't work
                 newItem['webpage'] = value['Account Webpage'];
                 newItem['box_height_number'] = value['Box Height'];
                 newItem['box_width_number'] = value['Box Width'];
                 newItem['x_coordinate_number'] = value['X Coordinate'];
                 newItem['y_coordinate_number'] = value['Y Coordinate'];
                 newItem['attribute_id'] = value['Attribute'];
                 newItem['initial_drawn_scale_number'] = value['Initial drawn scale'];
                 //newItem['attribute_name'] = value['attribute_custom_attribute'].get('name_text');
                 //newItem['webpage_screenshot_custom_webpage_screenshot'] = value['attribute_custom_attribute'].get('webpage_screenshot_custom_webpage_screenshot');
                 newItem['webpage_screenshot_custom_webpage_screenshot'] = 'https://via.placeholder.com/150';
                 instance.data.DASTOAS.push(newItem);
                 instance.data.logging ? console.log("newItemDAS", newItem) : null;
             });
         }
         instance.data.logging ? console.log("DAS -instance.data.DASTOAS", instance.data.DASTOAS) : null;
         //could be combined with above
         if (TOAS.length != 0) {
             TOASArray.forEach((value) => {
                 var newItem = {};
                 newItem['type'] = 'text';
                 instance.data.TOASProperties.forEach((att) => {
                     newItem[att] = value[att];
                 });
                 //required as looping function just wouldn't work
                 newItem['webpage'] = value['Account Webpage'];
                 newItem['attribute_id'] = value['Attribute'];
                 newItem['text_snippet__text'] = value['Text Snippet '];
                 instance.data.DASTOAS.push(newItem);
                 instance.data.logging ? console.log("newItemTOAS", newItem) : null;
             });
         }
         instance.data.logging ? console.log("TOAS-instance.data.DASTOAS", instance.data.DASTOAS) : null;
         APSArray.forEach((value) => {
             value.attribute_id_text = value['Attribute'];
             value.attribute_name_text = value['Attribute Name'];
         });
         //add dastoas to APS data    
         APSArray.forEach((aps) => {
             //console.log("Start array filter");
             const matchingObjs = instance.data.DASTOAS.filter((dastoas) => dastoas.attribute_id === aps
                 .attribute_id_text);
             if (matchingObjs.length > 0) {
                 aps.DASTOAS = matchingObjs;
             }
         });
         instance.data.logging ? console.log("End-DAS, TOAS, DASArray, TOASArray, DASV, TOASV, APS, APSArray", DAS,
             TOAS, DASArray, TOASArray, DASV, TOASV, APS, APSArray) : null;
     }
     //Add slider function
  instance.data.addSlider = (aps) => {
     if (instance.data.isBubble || !instance.data.isBubble) {
         instance.data.logging ? console.log("start addslider", aps) : null;
         aps.forEach((aps) => {
             instance.data.logging ? console.log("slider-create", aps._id) : null;
             var mainElement = $(`#slider-aps-${aps._id}`);
             //instance.data.mainElement = mainElement;
             //console.log("mainELement", mainElement);
             if (mainElement.length != 0) {
                 mainElement.addClass('carousel');
                 //instance.data.logging ? console.log("mainElement", mainElement):null;
                 //   slider.classList.add('carousel', `slider-buttons-aps-${aps._id}`);
                 ///new
                 var carousel = document.createElement('div');
                 carousel.id = aps._id;
                 carousel.classList.add('carousel');
                 //instance.data.logging ? console.log("carousel", carousel):null;
                 mainElement.append(carousel);
                 //instance.data.logging ? console.log("mainElement-after carousel", mainElement):null;
                 var slider = new Flickity(`#slider-aps-${aps._id}`, {
                     wrapAround: true,
                     prevNextButtons: true,
                     pageDots: false
                 });
                 let textDastoas = [];
                 let imageDastoas = [];
                 if (aps.DASTOAS) {
                     textDastoas = aps.DASTOAS.filter((dastoas) => dastoas.type === 'text');
                     imageDastoas = aps.DASTOAS.filter((dastoas) => dastoas.type === 'image');
                 }
                 // iterate through textDastoas
                 if (textDastoas) {
                     textDastoas.forEach((dastoas) => {
                         var newElement = document.createElement('div');
                         newElement.classList.add('carousel-cell');
                         newElement.innerHTML =
                             `<div class="div-text crop-das-${dastoas._id} carousel-text">${dastoas.text_snippet__text}</div>`;
                         newElement.id = dastoas._id;
                         newElement.type = 'Text';
                         //instance.data.logging ? console.log("newElement text", newElement):null;
                         newElement.addEventListener("click", instance.data.selectSnippet);
                         if (slider) {
                             slider.append(newElement);
                         }
                         /* OLD
                 const newElement = document.createElement('div');
                 newElement.innerHTML =
                     `<div class="div-text" width="100px">${dastoas.text_snippet__text}</div>`;
                 slider.appendChild(newElement);
                 */
                     });
                 }
                 // iterate through imageDastoas
                 if (imageDastoas) {
                     imageDastoas.forEach((dastoas) => {
                         var newElement = document.createElement('div');
                         newElement.classList.add('carousel-cell');
                         newElement.innerHTML =
                             `<div class="image crop-das-${dastoas._id}"><img class="carousel-img image"/></div>`;
                         newElement.id = dastoas._id;
                         newElement.type = 'Image';
                         //instance.data.logging ? console.log("newElement img", newElement):null;
                         newElement.addEventListener("click", instance.data.selectSnippet);
                         if (slider) {
                             slider.append(newElement);
                         }
 
                     });
                 }
                 //mainElement.append(slider);
                 //instance.data.logging ? console.log("mainElement-after,slider ", mainElement, slider);
             }
         })
     }
 }
     //addQuill
     instance.data.addQuillEditor = (editor) => {
         instance.data.logging ? console.log('AddQuillEditor Declared') : null;
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
             debug: 'warn',
             bounds: editor
         });
         const toolbar = quill.root.parentElement.previousSibling;
         toolbar.setAttribute('hidden', true);
         quill.root.parentElement.style.borderTop = `1px`;
         quill.root.addEventListener('focus', (e) => {
             instance.data.focused = true
             toolbar.removeAttribute('hidden', false)
         })
         const handleClick = (e) => {
             instance.data.logging ? console.log(`editor`, editor.parentElement.id) : null;
             if (!e.target.closest(`[id="${editor.parentElement.id}"]`)) {
                 instance.data.logging ? console.log(`hiding toolbar: the target is`, e.target,
                     `and the toolbar is`, toolbar, `and the preview is`, e.target.classList.contains(
                         'ql-preview')) : null;
                 toolbar.setAttribute('hidden', true);
             }
         }
         window.addEventListener('click', handleClick)
         quill.root.addEventListener('blur', (e) => {
             // instance.data.focused = false
             // if (e.relatedTarget == null) {
             //     toolbar.setAttribute('hidden', true)
             // }
             // else if (!toolbar.contains(e.relatedTarget) && !e.relatedTarget.classList.contains('ql-preview')) {
             //     toolbar.setAttribute('hidden', true)
             // }
         });
         /* quill.root.addEventListener('blur', e => {
               instance.data.logging ? console.log('blur'):null;   
              instance.data.focused = false;
              const tooltip = e.find('.ql-tooltip');
              const tooltipStyle = window.getComputedStyle(tooltip);
              if (!toolbar.contains(e.relatedTarget) && tooltipStyle.display === 'none') {
                  toolbar.setAttribute('hidden', true);
                  const toolbars = document.querySelectorAll('.toolbar');
                  toolbars.forEach(toolbar => {
                      toolbar.setAttribute('hidden', true);
                  });
              }
          }); */
         quill.on('editor-change', (eventName, ...args) => {
             if (eventName === 'text-change') {
                 instance.data.handleStopTyping(editor);
                 instance.data.logging ? console.log("editor", editor) : null;
             } else if (eventName === 'selection-change') {
                 // Handle selection change
             }
         });
         const removeEventListener = window[`removeEventListener_${editor.parentElement.id}`] = () => {
             window.removeEventListener('click', handleClick);
         }
         return {
             removeEventListener
         };
     };
     //deletefold
     instance.data.deleteFoldCollapse = () => {
         instance.data.logging ? console.log("deleteFoldInitiated") : null;
         waitForElm('.disclose').then((elm) => {
             $('.disclose').unbind();
             $('.disclose').on('click', function() {
                 instance.data.logging ? console.log("disclose onclick") : null;
                 $(this).closest('li').toggleClass('mjs-nestedSortable-collapsed').toggleClass(
                     'mjs-nestedSortable-expanded');
                 $(this).toggleClass('ui-icon-plusthick').toggleClass('ui-icon-minusthick');
             });
         });
         waitForElm('.deleteMenu').then((elm) => {
             $('.deleteMenu').unbind();
             $('.deleteMenu').click(function() {
                 let uniqueId = $(this).attr('data-id');
                 let card_id = "#menuItem_" + uniqueId;
                 if ($(card_id).length == 0) {
                     return;
                 }
                 if (window.confirm("Are you sure you want to delete this card ?")) {
                     let childCardsIdList = $(card_id).find('li');
                     let idArray = [];
                     childCardsIdList.each(function(index) {
                         idArray.push($(this).attr('id'));
                     });
                     $(card_id).remove();
                     setTimeout(function() {
                         instance.publishState("htmlobject", instance.canvas.html());
                         instance.data.hierarchy();
                     }, 10);
                     setTimeout(function() {
                         instance.publishState("deletedcard_id", uniqueId);
                         instance.publishState("deletedchildren_id_list", idArray
                     .toString());
                         instance.triggerEvent("deleted");
                     }, 10);
                 }
             });
         });
         waitForElm('.expandEditor').then((elm) => {
             $('.expandEditor').unbind();
             $('.expandEditor').click(function() {
                 instance.data.logging ? console.log("expand onclick") : null;
                 let uniqueId = $(this).attr('data-id');
                 $('#' + uniqueId + '.quillEditor').toggle('fast', 'swing');
                 if ($('.expandEditor[data-id=' + uniqueId + ']').html() === 'expand_more') {
                     $('.expandEditor[data-id=' + uniqueId + ']').html('expand_less');
                 } else {
                     $('.expandEditor[data-id=' + uniqueId + ']').html('expand_more');
                 }
                 //CSP Add for Slider
                 if ($(`#slider-aps-${uniqueId}`).hasClass('slider_invisible')) {
                     $(`#slider-aps-${uniqueId}`).removeClass('slider_invisible');
                 } else {
                     $(`#slider-aps-${uniqueId}`).addClass('slider_invisible');
                 }
                 //end CSP Add
             });
         });
     }
     //add single items
     instance.data.addSingleDAS = (das, aps1) => {
         instance.data.logging ? console.log("addSingleDas", das, aps1) : null;
         let newDAS = das;
         let aps2 = aps1;
         let id = newDAS.get('_id');
         let apsId = aps2._id;
         var newElement = document.createElement('div');
         newElement.classList.add('carousel-cell');
         newElement.innerHTML = `<div class="image crop-das-${id}"><img class="carousel-img image"/></div>`;
         newElement.id = id;
         newElement.type = 'Image';
         //instance.data.logging ? console.log("newElement img", newElement):null;
         newElement.addEventListener("click", instance.data.selectSnippet);
         var carousel = $(`#slider-aps-${apsId}`).flickity({
             initialIndex: 1
         });
         carousel.flickity('append', newElement);
     }
     instance.data.addSingleTOAS = (toas, aps1) => {
         let newTOAS = toas;
         let aps = aps1;
         let id = newTOAS.get('_id');
         let text = newTOAS.get('text_snippet__text');
         let apsId = aps._id;
         var newElement = document.createElement('div');
         newElement.classList.add('carousel-cell');
         newElement.innerHTML = `<div class="div-text crop-das-${id} carousel-text">${text}</div>`;
         newElement.id = id;
         newElement.type = 'Text';
         //instance.data.logging ? console.log("newElement text", newElement):null;
         newElement.addEventListener("click", instance.data.selectSnippet);
         var carousel = $(`#slider-aps-${apsId}`).flickity({
             initialIndex: 1
         });
         carousel.flickity('append', newElement);
     }
     instance.data.savecard = (card, index) => {
         instance.publishState('editedcard_id', card.id);
         //instance.publishState('htmlobject', instance.canvas.html());
         instance.publishState('quill_editor_content', card.content);
         setTimeout(() => {
             instance.triggerEvent('stopped_typing')
         }, 100 * index);
     }
     instance.data.saveAllCards = (editors_array) => {
         for (let i = 0; i < editors_array.length; i++) {
             instance.data.savecard(editors_array[i], i);
         }
     }
 
     function waitForElm(selector) {
         return new Promise((resolve) => {
             if (document.querySelector(selector)) {
                 return resolve(document.querySelector(selector));
             }
             const observer = new MutationObserver((mutations) => {
                 if (document.querySelector(selector)) {
                     resolve(document.querySelector(selector));
                     observer.disconnect();
                 }
             });
             observer.observe(document.body, {
                 childList: true,
                 subtree: true
             });
         });
     }
     window.CSP = instance;
     //end initialize



     //////////////////////////




         //start update
    //instance.data.logging = properties.logging;

    function buildHierarchyHtml(hierarchy1) {
        instance.data.logging ? console.log("heirBuild", hierarchy1) : null;
        let hierarchy = JSON.parse(hierarchy1);
        instance.data.logging ? console.log('buildHierarchyHtml Declared', hierarchy.length) : null;
        let cardListHtml = '';
        for (let i = 0; i < hierarchy.length; i++) {
            let hierarchyItem = hierarchy[i];
            let hierarchyItemId = hierarchyItem.id;
            instance.data.logging ? console.log('hierarchyitem and id' + hierarchy[i] + hierarchyItem.id) : null;
            //Get the snippet that corresponds to this item
            let thesnippet = instance.data.APS.filter((snippet) => {
                if (hierarchyItemId == snippet._id) {
                    return snippet;
                }
            })[0];
            //Pass thesnippet to html generator
            instance.data.logging ? console.log("theSnippet", thesnippet) : null;
            if (thesnippet) {
                cardListHtml += instance.data.generateListItemHtml(thesnippet);
            }
            console.log('cardListHtml B4', cardListHtml, 'item', hierarchyItemId, 'hierarchy.children', hierarchyItem.children);
            let childCardHtml = '';
            if (hierarchyItem.children) {
                childCardHtml += '<ol>'
                childCardHtml += buildHierarchyHtml(JSON.stringify(hierarchyItem.children));
                childCardHtml += '</ol>';
            }
            cardListHtml += childCardHtml;
        }
        cardListHtml += '</li>';
        return cardListHtml;
    }
    instance.data.callNestedSortable();
    if (!instance.data.halt) {


        //triggers selection of snippet
        instance.data.selectSnippet = (evt) => {
            instance.data.logging ? console.log('selectSnippet', evt.currentTarget.id) : null;
            instance.publishState('selectedsnippet', `${evt.currentTarget.id}|||${evt.currentTarget.type}`);
            instance.triggerEvent('select_snippet');
        }

        ///add stragglers 

        if (!instance.data.start) {

            instance.data.DASAdd = properties.das.get(0, properties.das.length());
            instance.data.TOASAdd = properties.toas.get(0, properties.toas.length());

            instance.data.DASAdd.forEach((das) => {
                instance.data.logging ? console.log("checking das", das) : null;
                let id = das.get('_id');
                let found = $(`.crop-das-${id}`).length;
                if (!found && instance.data.APS.length) {
                    let apsID = das.get('attribute_custom_attribute').get('_id');
                    const aps1 = instance.data.APS.filter((aps2) => aps2.attribute_id_text === apsID);

                    instance.data.logging ? console.log("das Add", das, aps1[0]) : null;
                    instance.data.singleDas = das;
                    instance.data.singleAPS = aps1;
                    if (aps1[0] && das) {
                        instance.data.addSingleDAS(das, aps1[0]);
                    }
                } else {
                    instance.data.logging ? console.log("das Found") : null;
                }
            });

            instance.data.TOASAdd.forEach((toas) => {
                instance.data.logging ? console.log("checking toas", toas) : null;
                let id = toas.get('_id');
                let found = $(`.crop-das-${id}`).length;
                if (!found) {
                    instance.data.logging ? console.log("toas Add", toas) : null;
                    let apsID = toas.get('attribute_custom_attribute').get('_id');
                    const aps1 = instance.data.APS.filter((aps2) => aps2.attribute_id_text === apsID);
                    if (aps1[0] && toas) {
                        instance.data.addSingleTOAS(toas, aps1[0]);
                    }
                } else {
                    instance.data.logging ? console.log("das Found") : null;
                }
            });

        }


        //CSP add for data purposes,bubble
        instance.data.logging ? console.log("instance.data.isBubble instance.data.start", instance.data.isBubble, instance.data.start) : null;
        if (instance.data.isBubble && instance.data.start) {
            instance.data.plan_unique_id = properties.plan_unique_id;
            instance.data.hierarchyInitial = properties.hierarchycontent;
            instance.data.html_field = properties.html_field;
            let DAS = properties.das.get(0, properties.das.length());
            let TOAS = properties.toas.get(0, properties.toas.length());

            instance.data.DASTOASCount = DAS.length + TOAS.length;
            let DASProperties = ['account_webpage_custom_account_webpage', 'attribute_custom_attribute',
                'box_height_number', 'box_width_number', 'corner_roundness_number', 'initial_drawn_scale_number',
                'mobile_screenshot_custom_webpage_screenshot', 'stroke_width_number', 'syllabus_box_side_number',
                'syllabus_box_width_number', 'webpage_screenshot_custom_webpage_screenshot', 'x_coordinate_number',
                'y_coordinate_number', 'Created By', 'Slug', 'Created Date', 'Modified Date', '_id'
            ];
            let TOASProperties = ['attribute_custom_attribute',
                'highlighted_text_detail_api_1644871875958x568208585554657300_plugin_api_ABO',
                'rangy_highlight_data_api_1665429109854x993084194572730400_plugin_api_ACp', 'text_snippet__text',
                'webpage_custom_account_webpage', 'Created By', 'Slug', 'Created Date', 'Modified Date', '_id'
            ];
            let APSProperties = ['attribute_custom_attribute', 'attribute_id_text', 'attribute_name_text',
                'description_text', 'parent_plan_snippet_custom_attribute_plan_snippet', 'plan_custom_zplan',
                'quill_description_text', 'rank_in_plan_number', 'Created By', 'Slug', 'Created Date',
                'Modified Date', '_id'
            ];
            instance.data.DASProperties = DASProperties;
            instance.data.TOASProperties = TOASProperties;
            instance.data.APSProperties = APSProperties;
            const keyListDataSource = properties.data_source.get(0, properties.data_source.length())[0];
            let dSList = properties.data_source.get(0, properties.data_source.length());
            let DASV = properties.drawn_attribute_snippets_volume.get(0, properties.drawn_attribute_snippets_volume
                .length());
            let TOASV = properties.text_only_attribute_snippets_volume.get(0, properties
                .text_only_attribute_snippets_volume.length());
            let APS = properties.aps.get(0, properties.aps.length());
            ///add new arrays and processs
            instance.data.DAS = [];
            instance.data.TOAS = [];
            instance.data.APS = [];
            instance.data.addDASTOAS(DAS, TOAS, instance.data.DAS, instance.data.TOAS, DASV, TOASV, APS, instance.data
                .APS);
            instance.data.logging ? console.log("starting isBubble main") : null;
            instance.data.logging ? console.log("APS modified", instance.data.APS) : null;
            instance.data.data_source_length = instance.data.APS.length;
            instance.data.data_source_initial = instance.data.APS.length;
            main();
        }
        //////////Experimental Data grab from API
        if (!instance.data.isBubble) {
            instance.data.logging ? console.log("!isBubble") : null;
            var planId = '1678808469407x515207012437458940';
            //
            instance.data.getAPS = function(plan) {
                // Create a form data object
                let bodyContent = new FormData();
                bodyContent.append("plan_id", plan);
                let headersList = {
                    "Accept": "*\/*",
                };
                // Fetch the data from the API endpoint using POST method
                instance.data.logging ? console.log("fetchstarting") : null;
                fetch(`https://d110.bubble.is/site/proresults/version-33/api/1.1/wf/get_aps`, {
                    method: "POST",
                    body: bodyContent,
                    headers: headersList
                }).then((response) => response.json()).then((result) => {
                    instance.data.logging ? console.log("response", result.response) : null;
                    instance.data.result = result.response;
                    instance.data.APS_result = result.response.APS;
                    onDataLoaded();
                    return result;
                }).catch((error) => {
                    instance.data.logging ? console.log("error", error) : null;
                    throw error
                });
            }
            //
            instance.data.properties = properties;
            instance.data.getAPS(planId);
        }
        ///load function
        function onDataLoaded() {
            instance.data.logging ? console.log("results", instance.data.result, "instance.data.APS_result", instance.data.APS_result) : null;
            ///update variables
            properties.data_source = instance.data.APS_result;
            instance.data.logging ? console.log("log results", instance.data.result['APS'], instance.data.result.APS, properties.data_source) : null;
            /* properties.type_of_items = '';
    
                 properties.html_field = 
                 properties.type_of_items_type = {};
                 instance.data.data_source_length = instance.data.APS_result.length;
                 instance.data.snippetsTransform = instance.data.result['APS'];
                 let snippetsData = ["Attribute", "Attribute ID", "Attribute Name", "Created By", "Created Date",
                     "Modified Date", "Plan", "_id"
                 ];
                 */

            ///
            instance.data.data_source_length = instance.data.APS_result.length;
            instance.data.plan_unique_id = instance.data.result.Plan['_id'];
            instance.data.hierarchyInitial = instance.data.result.Plan['Hierarchy Content'];
            console.log('Hier content',instance.data.hierarchyInitial);
            //instance.data.hierarchyInitial = `[{"id":"1678415203749x380697560508006400","foo":"bar"},{"id":"1678415192492x736722261622652900","foo":"bar"},{"id":"1678398093386x413274195503349760","foo":"bar"},{"id":"1678400741256x961039459617341400","foo":"bar"},{"id":"1678400899822x568186102965862400","foo":"bar"}]`;
            instance.data.html_field = instance.data.hierarchyInitial;
            let DAS = instance.data.result['DAS'];
            let TOAS = instance.data.result['TOAS'];
            let DASV = instance.data.result['DASV'];
            let TOASV = instance.data.result['TOASV'];
            let APS = instance.data.result['APS'];
            let DASProperties = ['Desktop Screenshot', 'Modified Date', 'Created Date', 'Created By', 'Y Coordinate', 'X Coordinate', 'Box Width', 'Box Height', 'Attribute', 'Account Webpage', 'Initial drawn scale', '_id'];
            let TOASProperties = ['Created Date', 'Attribute', 'Webpage', 'Text Snippet ', 'Created By', 'Modified Date', '_id'];
            let APSProperties = ['Plan', 'Modified Date', 'Created By', 'Created Date', 'Attribute', 'Attribute Name', 'Attribute ID', '_id'];
            instance.data.logging ? console.log("props", DASProperties, TOASProperties, APSProperties) : null;
            instance.data.DASProperties = DASProperties;
            instance.data.TOASProperties = TOASProperties;
            instance.data.APSProperties = APSProperties;


            ///add new arrays and processs
            instance.data.DAS = [];
            instance.data.TOAS = [];
            instance.data.APS = [];
            instance.data.addDASTOASAPI(DAS, TOAS, instance.data.DAS, instance.data.TOAS, DASV, TOASV, APS, instance.data
                .APS);
            instance.data.logging ? console.log("starting isBubble main") : null;
            instance.data.logging ? console.log("APS modified", instance.data.APS) : null;
            instance.data.data_source_length = instance.data.APS.length;
            instance.data.data_source_initial = instance.data.APS.length;

            main();
            setTimeout(instance.data.deleteFoldCollapse, 200);
        }
        //get data

        //end experimental
        //end CSP data add

        //We create the html from the attribute plan snippets only in the first render, for all subsequent renders, we use the hierarchy object (hierarchyContent)
        //used to allow for data processing before startup
        function main() {
            //instance.data.halt = true;
            console.log("main called", instance.data.hierarchyInitial, instance.data.start);
            window.CSP = instance;
                       // Looping through all the attribute plan snippets and creating their markup the first time when its loaded when theres no hierarchy data
                       if (!instance.data.hierarchyInitial && instance.data.start) {
                        instance.data.logging ? console.log('hierarchyContent not present. Rendering from data_source') : null;
                        let cardsListHtml = '';
                        for (let i = 0; i < instance.data.APS.length; i++) {
                            //instance.data.logging ? console.log("attsnipgen", instance.data.APS[i]);
                            cardsListHtml += instance.data.generateListItemHtml(instance.data.APS[i]) + '</li>';
                            //instance.data.logging ? console.log('GenrateListHtml Called'):null;
                            //instance.data.logging ? console.log(cardsListHtml):null;
                        };
                        let cardStackHtml = '<ol id="' + instance.data.plan_unique_id +
                            '" class="sortable ui-sortable mjs-nestedSortable-branch mjs-nestedSortable-expanded">' +
                            cardsListHtml + "</ol>";
                        //instance.data.logging ? console.log(cardStackHtml):null;
                        instance.canvas.html(cardStackHtml)
                    } else if (instance.data.hierarchyInitial && instance.data.start) {
                        let cardStackHtml = '<ol id="' + instance.data.plan_unique_id +
                            '" class="sortable ui-sortable mjs-nestedSortable-branch mjs-nestedSortable-expanded">' +
                            buildHierarchyHtml(instance.data.hierarchyInitial) + "</ol>";
                        instance.data.logging ? console.log('hierarchyContent present. BuildHierarchy HTML Called') : null;
                        instance.canvas.html(cardStackHtml);
                    }

            //CSP Add create sliders
            instance.data.logging ? console.log("sliderpoint", instance.data.APS) : null;
            instance.data.addSlider(instance.data.APS);

            //After generating the html, we call Nested Sortable and Quill on it
            instance.data.callNestedSortable();
            instance.data.logging ? console.log('NestedSortable Called') : null;
            //$(".ql-toolbar").remove() ***NOTE*** - Check if needed or not
            document.querySelectorAll(".quillEditor").forEach((editor) => {
                instance.data.logging ? console.log('AddQuillEditor Called') : null;
                instance.data.addQuillEditor(editor);
            });
            //Call toHierarchy function to update the hierarchy object
            //CSP needs to be at end of main()
            if (instance.data.start) {
                //instance.data.halt = true;
                if (instance.data.html_field && !instance.data.hierarchyInitial) {
                    instance.data.logging ? console.log('Checking for JQuery Html') : null;
                    instance.canvas.html(instance.data.html_field);
                    instance.data.editor_contents = new Array();
                    instance.data.allcards = $('ol.sortable#' + properties.plan_unique_id + " li")
                    for (let i = 0; i < instance.data.allcards.length; i++) {
                        if (instance.data.allcards[i].id) {
                            instance.data.editor_contents.push({
                                id: instance.data.allcards[i].id,
                                content: $("#" + instance.data.allcards[i].id).find(".ql-editor").html()
                            })
                            instance.data.allcards[i].id = "menuItem_" + instance.data.allcards[i].id;
                        }
                    }
                    instance.data.saveAllCards(instance.data.editor_contents);
                    instance.data.callNestedSortable();
                    setTimeout(instance.data.hierarchy, 3000);
                    setTimeout(instance.data.deleteFoldCollapse, 1000);
                }
                if (instance.data.data_source_initial == instance.data.data_source_length && instance.data
                    .hierarchyInitial == instance.data.hierarchycontent && instance.canvas.innerHtml !=
                    "" && instance.data.hierarchyInitial != "") {
                    setTimeout(instance.data.deleteFoldCollapse, 1000);
                    return;
                }

            }

            instance.data.start = false;
        }
        instance.data.halt = false;
        //Calling DeleteFoldCollapse listeners
        instance.data.logging ? console.log('Delete,Fold and Collapse Functions Called - Update') : null;



       
    }
    setTimeout(instance.data.deleteFoldCollapse, 200);
   // instance.data.start = false;
    //end update

//add new list item
    //When a new card is dropped, it has to become part of the hierarchy object 
    //1. Pass that Attribute Plan Snippet to the Plugin 
    //2. Render its html
    //3. Append that to the bottom of the list
    //4. Call hierarchy function

    //initialize variables
    /*
    let DAS = properties.das.get(0, properties.das.length());
    let TOAS = properties.toas.get(0, properties.toas.length());
    //console.log("DAS,TOAS", DAS, TOAS);
    let DASV = properties.drawn_attribute_snippets_volume.get(0, properties.drawn_attribute_snippets_volume.length());
    let TOASV = properties.text_only_attribute_snippets_volume.get(0, properties.text_only_attribute_snippets_volume
        .length());
    let APS = properties.aps.get(0, properties.aps.length());

    ///add new arrays and processs
    instance.data.DASnew = [];
    instance.data.TOASnew = [];
    instance.data.APSnew = [];
    //console.log(`BeforeSend-(DAS, TOAS, instance.data.DASnew, instance.data.TOASnew, DASV, TOASV, APS, instance.data.APSnew)`, DAS, TOAS, instance.data.DASnew, instance.data.TOASnew, DASV, TOASV, APS, instance.data.APSnew);
    instance.data.addDASTOAS(DAS, TOAS, instance.data.DASnew, instance.data.TOASnew, DASV, TOASV, APS, instance.data.APSnew);

     instance.data.logging ? console.log('Add New List Item Ran', instance.data.plan_unique_id):null;
    //Call generatelist item on newly dropped card
    let newlyDroppedCardHtml = instance.data.generateListItemHtml(instance.data.APSnew[0]);
     instance.data.logging ? console.log("newlyDroppedCardHtml", newlyDroppedCardHtml):null;
    //Append that to the innerhtml of the ol.sortable list
    let cardStackInnerHtml = $('ol.sortable#' + instance.data.plan_unique_id);
    //Append the new li item to the existing cardstack
    //instance.data.cardstack = cardStackInnerHtml;
    cardStackInnerHtml.prepend(newlyDroppedCardHtml);
    //instance.data.addQuillEditor(cardStackInnerHtml.find(".quillEditor")[0]);
    instance.data.logging ? console.log("prepended"): null;
    instance.data.addSlider(instance.data.APSnew);
    instance.data.APS = instance.data.APSnew.concat(instance.data.APS);
    
    //Call hierarchy
    setTimeout(instance.data.hierarchy, 100);
    setTimeout(instance.data.deleteFoldCollapse, 200);
//
    //add new list itme button
    var button = document.createElement('button');
button.innerHTML = 'Add a new list item';
document.body.appendChild(button);
button.onclick = function() {
addNewListItem();
}
*/