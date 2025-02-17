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

    ctor(){
        this.changeParts = ["DLJM_DL_02", "DLJM_DZ_GunZi"];
        this.buttonName = ["燈籠", "棍子"];
        this.changeSpriteFrames = null;
    },

    // use this for initialization
    onLoad: function () {

        cc.assetManager.loadBundle('ChangeTexture',function (err, bundle){
            //初始化bundle下載
            bundle.loadDir("", cc.SpriteFrame, function (err, bundle){
                cc.log("載完了");
                cc.log(bundle);
                this.changeSpriteFrames = bundle;
                this._testChange();
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

    _testChange() {
        for (let i = 0; i < this.changeParts.length; i++) {
            let targetSlot = this.targetSpine.findSlot(this.changeParts[i]);
            let targetAtt = targetSlot.getAttachment();
            cc.log("test：", targetSlot);

            let textureName = this.changeParts[i];
            let region = this.createRegion(this.changeSpriteFrames.find((spriteFrame) => spriteFrame.name == textureName));

            if (typeof (targetAtt.setRegion) == "function") {
                // if (att.constructor.name == "RegionAttachment") {
                targetAtt.setRegion(region);
                targetAtt.updateOffset();
                // } else if (att.constructor.name == "MeshAttachment") {
            } else {
                targetAtt.region = region;
                targetAtt.updateUVs();
            }
        }
    },

    // 產生新的Region，用來更換新圖片
    createRegion(frame) {
        // cc.log(frame.name)
        let texture = frame.getTexture();
        console.log("createRegion：", texture)

        let skeletonTexture = new sp.SkeletonTexture({ width: texture.width, height: texture.height });
        skeletonTexture.setRealTexture(texture);

        let page = new sp.spine.TextureAtlasPage();
        page.name = texture.name;
        page.uWrap = sp.spine.TextureWrap.ClampToEdge;
        page.vWrap = sp.spine.TextureWrap.ClampToEdge;
        page.texture = skeletonTexture;
        page.texture.setWraps(page.uWrap, page.vWrap);
        page.width = texture.width;
        page.height = texture.height;

        let region = new sp.spine.TextureAtlasRegion();
        region.page = page;
        region.name = frame.name
        // region.width = texture.width;
        // region.height = texture.height;
        // region.originalWidth = texture.width;
        // region.originalHeight = texture.height;

        region.width = frame._rect.width;
        region.height = frame._rect.height;
        region.x = frame._rect.x;
        region.y = frame._rect.y;
        // region.originalWidth = frame._originalSize.width;
        // region.originalHeight = frame._originalSize.height;
        region.originalWidth = frame._rect.width;
        region.originalHeight = frame._rect.height;

        // region.rotate = false;
        region.rotate = frame._rotated;

        // region.u = 0;
        // region.v = 0;
        // region.u2 = 1;
        // region.v2 = 1;
        region.u = frame["uv"][0];
        region.v = frame["uv"][7];
        region.u2 = frame["uv"][6];
        region.v2 = frame["uv"][1];

        region.texture = skeletonTexture;
        return region;
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
