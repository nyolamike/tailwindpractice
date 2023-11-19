var APP_NAME = "Roberoscope";

var vsd = {
    nextId: 1,
    refs: {},
    config: {},
    isBound: false,
    graph: null,
    bind: function(){
        var vmRbs = this;
        Draw.loadPlugin(function(ui){
            vmRbs.graph = ui.editor.graph;
            vmRbs.isBound = true;
        });
        return this;
    }, 
    handleMessage: function(message){
        var vmRbs = this;
        if (Object.hasOwnProperty.call(vmRbs.config, message.stage)) {
            const rbsStageConfigActions = vmRbs.config[message.stage];
            vmRbs.graph.getModel().beginUpdate();
            for (var index = 0; index < rbsStageConfigActions.length; index++) {
                var rbsActionConfig = rbsStageConfigActions[index];
                console.log("Here we are:" + index, rbsActionConfig);
                var actionName = rbsActionConfig.action.toLowerCase().replaceAll(" ","");
                vmRbs[actionName](rbsActionConfig.inputs, rbsActionConfig.value);
            }
            vmRbs.graph.getModel().endUpdate();
        }else{
            console.log(APP_NAME + ": Missing setup stage of message ");
            console.log("message: ", message);
        }
    },
    setup: function(conf){
        this.config = conf;
        return this;
    },
    setfillcolor: function(inputs, value){
        var vmRbs = this;
        
        for (var index = 0; index < inputs.length; index++) {
            var input = inputs[index];
            var cell = vmRbs.graph.getModel().cells[input];
            var cs = cell.getStyle();
            var styleSplits = cs.split(";");
            var styleUpdates = [];
            for (var iStyle = 0; iStyle < styleSplits.length; iStyle++) {
                var stylet = styleSplits[iStyle];
                var skv = stylet.split("=");
                var cssKey = skv[0];
                if(cssKey == "fillColor"){
                    styleUpdates.push("fillColor="+value);
                }else{
                    styleUpdates.push(stylet);
                }
            }
            var styleUpdatesStr = styleUpdates.join(";");
            vmRbs.graph.getModel().setStyle(cell, styleUpdatesStr);
        }
        
    },
    start: function(){
        var thisVm = this;
        thisVm.bind();
        // Enable pusher logging - don't include this in production
        // Pusher.logToConsole = true;
        var pusher = new Pusher('32f739e672371238d05b', {
            cluster: 'ap2'
        });
        var channel = pusher.subscribe('default');
        channel.bind('update', function(data) {
            thisVm.handleMessage(data);
        });
    }
}