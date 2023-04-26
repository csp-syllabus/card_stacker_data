const triggerEventFunctions = [];
const triggerStateUpdates = [];
const preProxyBubbleStates = {
  one: null,
  two: null,
  three: null,
  dastoas: null
};

const bubbleStatesProxyHandler = {
  set(target, property, value) {
    console.log('target, property, value, target[property]',target, property, value,target[property]);
    if (target[property] !== value && property != "dastoas") {
        triggerStateUpdates.forEach((func) => func("page_state_1_previous_value", target[property]));
      target[property] = value;

      triggerStateUpdates.forEach((func) => func("state_1_value", value));
      
      setTimeout(() => {
        triggerEventFunctions.forEach((func) =>
          func("page_state_changed")
        );
      }, 100);
    }

    if (property === "dastoas") {
      publishState("dastoasid", value);
      triggerEvent("page_state_changed");
    }

    return true;
  },
};

const BubbleStates = new Proxy(
  preProxyBubbleStates,
  bubbleStatesProxyHandler
);

const triggerEventFunctions = [];
const triggerStateUpdates = [];
const preProxyBubbleStates = {
  one: null,
  two: null,
  three: null,
  dastoas: null
};

const bubbleStatesProxyHandler = {
  set(target, property, value) {
    console.log(target, property, value,triggerStateUpdates,triggerEventFunctions);              
    if (target[property] !== value) {
        triggerStateUpdates.forEach((func) => {
                                    if (property === "one") {
                                        console.log('prop is one');
                                    func("page_state_1_previous_value", target[property]);
                                        target[property] = value;
                                    }
                                    if (property === "dastoas") {
                                        console.log('prop is dastoas');
                                    func("dastoasid", target[property]);
                                        target[property] = value;
                                    }
                                    });
      

      triggerStateUpdates.forEach((func) => {
          if (property === "one") {func("state_1_value", value);}
          if (property === "dastoas") {func("dastoasid", value);}
      
      });
      
      setTimeout(() => {
        triggerEventFunctions.forEach((func) =>
          func("page_state_changed")
        );
      }, 100);
    }

    return true;
  },
};

const BubbleStates = new Proxy(
  preProxyBubbleStates,
  bubbleStatesProxyHandler
);