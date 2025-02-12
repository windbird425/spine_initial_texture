const { type } = require("os");

cc.Class({
    extends: cc.Component,

    properties: {
        sampleButton: {
            default: null,
            type: cc.Node
        },
        targetSpine: {
            default: null,
            type: sp.Skeleton
        },
        originSpine: {
            default: null,
            type: sp.Skeleton
        },
    },

    // use this for initialization
    onLoad: function () {

        cc.assetManager.loadBundle('ChangeTexture',function (err, bundle){
            //初始化bundle下載
            bundle.loadDir("", cc.SpriteFrame, function (err, bundle){
                cc.log("載完了");
                cc.log(bundle);
                this._initSkinButton();
            }.bind(this))
        }.bind(this));

        window.originSpine = this.originSpine;
    },

    _initSkinButton() {
        let skinNames = Object.keys(this.targetSpine.skeletonData.skeletonJson.skins);

        skinNames.forEach((element, index) => {
            let buttonNode = cc.instantiate(this.sampleButton);
            let xx = index % 6;
            let yy = Math.floor(index / 6);
            // buttonNode.name = "default";

            buttonNode.name = element;
            buttonNode.active = true;
            buttonNode.x = buttonNode.x + (xx * 150);
            buttonNode.y = buttonNode.y - (yy * 50);
            buttonNode.getChildByName("Background").getChildByName("Label").getComponent(cc.Label).string = element;

            this.node.addChild(buttonNode);
        });
    },

    onclickChangeSkin(event, customEventData) {
        let buttonNode = event.target;
        let labelComponent = buttonNode.getChildByName("Background").getChildByName("Label").getComponent(cc.Label);

        this.targetSpine.setSkin(labelComponent.string);
        this.originSpine.setSkin(labelComponent.string);
    },

    // called every frame
    update: function (dt) {

    },
});
