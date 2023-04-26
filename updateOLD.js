function(instance, properties, context) {
    console.log(properties.data_source);
    instance.data.disabled = properties.disabled;
    //start update
    //triggers selection of snippet
    if (!instance.data.halted) {

        function hierarchy() {
            console.log('toHierarchy Declared');
            //CSP Add
            //super dumb but seems to require it to be added first
            callNestedSortable()
            //CSP End
            let hierarchyContent = instance.canvas.find('ol.sortable').nestedSortable('toHierarchy', {
                startDepthCount: 0
            });
            setTimeout(function () {
                instance.publishState("hierarchycontent", JSON.stringify(hierarchyContent));
                instance.triggerEvent("relocated");
            }, 100);
            //save hierarchyContent object to the Plan
        }

        function buildHierarchyHtml(hierarchy) {
            console.log(hierarchy)
            hierarchy = JSON.parse(hierarchy);
            console.log('buildHierarchyHtml Declared');
            let cardListHtml = '';
            for (let i = 0; i < hierarchy.length; i++) {
                let hierarchyItem = hierarchy[i];
                let hierarchyItemId = hierarchyItem.id;
                console.log('hierarchyitem and id' + hierarchy[i] + hierarchyItem.id);
                //Get the snippet that corresponds to this item
                let thesnippet = instance.data.attplansnippets.filter((snippet) => {
                    if (hierarchyItemId == snippet.get("_id")) return snippet;
                })[0];
                //Pass thesnippet to html generator
                cardListHtml += thesnippet ? generateListItemHtml(thesnippet) : "";
                //console.log(cardListHtml);     
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
        //We create the html from the attribute plan snippets only in the first render, for all subsequent renders, we use the hierarchy object (hierarchyContent)
        // Looping through all the attribute plan snippets and creating their markup the first time when its loaded when theres no hierarchy data
        if (!properties.hierarchycontent) {
            console.log('hierarchyContent not present. Rendering from data_source');
            let cardsListHtml = '';
            for (let i = 0; i < properties.data_source.length(); i++) {
                cardsListHtml += generateListItemHtml(instance.data.attplansnippets[i]) + '</li>';
                console.log('GenrateListHtml Called');
                //console.log(cardsListHtml);
            };
            let cardStackHtml = '<ol id="' + properties.plan_unique_id +
                '" class="sortable ui-sortable mjs-nestedSortable-branch mjs-nestedSortable-expanded">' +
                cardsListHtml + "</ol>";
            //console.log(cardStackHtml);
            instance.canvas.html(cardStackHtml)
        } else if (properties.hierarchycontent) {
            let cardStackHtml = '<ol id="' + properties.plan_unique_id +
                '" class="sortable ui-sortable mjs-nestedSortable-branch mjs-nestedSortable-expanded">' +
                buildHierarchyHtml(instance.data.hierarchycontent) + "</ol>";
            console.log('hierarchyContent present. BuildHierarchy HTML Called');
            instance.canvas.html(cardStackHtml);
        }
        //After generating the html, we call Nested Sortable and Quill on it
        callNestedSortable();
        console.log('NestedSortable Called');
        //$(".ql-toolbar").remove() ***NOTE*** - Check if needed or not
        document.querySelectorAll(".quillEditor").forEach(editor => {
            console.log('AddQuillEditor Called');
            //this is a future data type that will be used to remove the event listeners properly. Currently they stick around and cause memory leaks
            const {
                removeEventListener
            } = addQuillEditor(editor);
            instance.data.removeFocusEventListenerFunctions.push(removeEventListener)
        });
        //Call toHierarchy function to update the hierarchy object
        console.log('toHierarchy Called');
        setTimeout(hierarchy, 100);
        //Calling DeleteFoldCollapse
        console.log('Delete,Fold and Collapse Functions Called');
        deleteFoldCollapse();
        
        
        //Function for ellipsis
       	// When the textarea is focussed, it's content will be whatever the description of that APS is. When it is not, it will show everything till the third line and then finish it with ellipsis
        //Steps - Add event listeners for focus and unfocus evenents.
                let cardTitles = document.querySelectorAll(".itemTitle")
        cardTitles.forEach ((textarea) => {
            let id = textarea.getAttribute("data-id");
            let attplansnippet = instance.data.attplansnippets.find((item) => item.get("_id") === id);
            let cardTitle = attplansnippet.get("attribute_name_text");
            textarea.addEventListener("focus", () => {
                console.log('Value set from db');
                textarea.value = attplansnippet.get("attribute_name_text");  
            });

            textarea.addEventListener("blur", () => {
                if (textarea.value.length > 150){
                console.log('Trimmed Value');
                textarea.value = textarea.value.slice(0,150) + "....";
                }
                else {
                    console.log('Untrimmed Value');
                 textarea.value = text;  
                }
            });

        });
        
    }
    
}