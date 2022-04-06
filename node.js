const axios = require("axios")
module.exports = function (RED) {
    function FunctionNode(n) {
        RED.nodes.createNode(this, n);
        if (RED.nodes.getNode(n.creds)){
            this.restApiKey = RED.nodes.getNode(n.creds).credentials.restApiKey;
        } else {
            this.restApiKey = "";
        }
        var node = this;
        this.name = n.name;

        for (var key in n) {
            node[key] = n[key] || "";
        }
        this.on('input', function (msg) {
            for (var i in msg) {
                if (i !== 'req' | i !== 'res' | i !== 'payload' | i !== 'send' | i !== '_msgid') {
                    node[i] = node[i] || msg[i];
                }
            }
            if(!node.url){
                if(node.api){
                    node.url = 'https://dapi.kakao.com/v2/search/'+ node.api.toLowerCase();
                }else{
                    node.url = 'https://dapi.kakao.com/v2/search/web';
                }
            }
            // node.error(node.url);
            node.options = {};
            node.options.headers = {};
            if(node.params){
                node.options.params = node.params;
            }else{
                node.options.params = {};
                node.options.params.query = n.query;
                node.options.params.sort = n.sort;
                node.options.params.size = n.size;
                node.options.params.page = n.page;
            }
            node.options.headers['Authorization'] = 'KakaoAK ' + node.restApiKey;

            axios.get(node.url, node.options)
                .then(function (response){
                    msg.payload = response.data;
                    node.send(msg);
                }).catch(function (err){
                    msg.payload = err;
                    node.send(msg);
                });
        });
    }

    RED.nodes.registerType("daumsearch", FunctionNode, {
        credentials: {
            restApiKey: {type:"text"}
        }
    });

    function kakaoRestApiKey(n){
        RED.nodes.createNode(this, n);
        this.restApiKey = n.restApiKey;
    }

    RED.nodes.registerType("kakaoRestApiKey", kakaoRestApiKey,{
        credentials: {
            restApiKey: {type:"text"}
        }
    });
};
