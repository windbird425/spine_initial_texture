const { type } = require("os");
const SplitType = cc.Enum({
    FunctionName: 0,
    RegionName: 1
})
const splitStr = "@";

cc.Class({
    extends: cc.Component,

    properties: {
        sampleButton: {
            default: null,
            type: cc.Node
        },
        regionButton: {
            default: null,
            type: cc.Node
        },
        downloadButton: {
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

    ctor() {
        this.changeParts = ["DLJM_DL_02", "DLJM_DZ_GunZi", "DLJM_JB_02"];
        this.regionButtonNames = ["燈籠", "棍子", "金幣"];
        this.changeSpriteFrames = null;
    },

    // use this for initialization
    onLoad: function () {

        cc.assetManager.loadBundle('ChangeTexture', function (err, bundle) {
            // 初始化bundle下載
            bundle.loadDir("", cc.SpriteFrame, function (err, bundle) {
                cc.log("載完了");
                cc.log(bundle);
                this.changeSpriteFrames = bundle;
                this.downloadButton.active = true;
                // window.downloadButton = this.downloadButton;
            }.bind(this))
        }.bind(this));

        // window.originSpine = this.originSpine;
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

    _initRegionButton() {
        this.regionButtonNames.forEach((element, index) => {
            // 更換按鈕
            let buttonNode = cc.instantiate(this.regionButton);
            let xx = index % 6;
            let yy = Math.floor(index / 6);

            buttonNode.name = "changeRegion@" + this.changeParts[index];
            buttonNode.active = true;
            buttonNode.x = buttonNode.x + (xx * 150);
            buttonNode.y = buttonNode.y - (yy * 50);
            buttonNode.getChildByName("Background").getChildByName("Label").getComponent(cc.Label).string = element;
            // 還原按鈕
            let recoverButtonNode = cc.instantiate(this.regionButton);
            // let xx = index % 6;
            // let yy = Math.floor(index / 6);

            recoverButtonNode.name = "recoverRegion@" + this.changeParts[index];
            recoverButtonNode.active = true;
            recoverButtonNode.x = recoverButtonNode.x + (xx * 150);
            recoverButtonNode.y = recoverButtonNode.y - (yy * 50);
            recoverButtonNode.getChildByName("Background").getChildByName("Label").getComponent(cc.Label).string = "還原" + element;

            this.node.addChild(buttonNode, 2);
            this.node.addChild(recoverButtonNode, 1);
        });
    },

    _initRegionButton2() {
        this.regionButtonNames.forEach((element, index) => {
            let buttonNode = cc.instantiate(this.regionButton);
            let xx = index % 6;
            let yy = Math.floor(index / 6);

            buttonNode.name = "recoverRegion@" + this.changeParts[index];
            buttonNode.active = true;
            buttonNode.x = buttonNode.x + (xx * 150);
            buttonNode.y = buttonNode.y - (yy * 50) - (buttonNode.height + 50);
            buttonNode.getChildByName("Background").getChildByName("Label").getComponent(cc.Label).string = "還原" + element;

            this.node.addChild(buttonNode);
        });
    },

    _testChange() {
        for (let i = 0; i < this.changeParts.length; i++) {
            let targetSlot = this.targetSpine.findSlot(this.changeParts[i]);
            let targetAtt = targetSlot.getAttachment();
            cc.log("test：", targetSlot);

            let textureName = this.changeParts[i];
            let region = this.createRegionBySpriteFrame(this.changeSpriteFrames.find((spriteFrame) => spriteFrame.name == textureName));

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

    // 產生新的Region，用來更換新圖片(用SpriteFrame)
    createRegionBySpriteFrame(frame) {
        // cc.log(frame.name)
        let texture = frame.getTexture(); // cc_Texture2D
        console.log("createRegionBySpriteFrame：", texture)

        let skeletonTexture = new sp.SkeletonTexture({ width: texture.width, height: texture.height });
        skeletonTexture.setRealTexture(texture);

        let page = new sp.spine.TextureAtlasPage();
        page.name = frame.name;
        page.uWrap = sp.spine.TextureWrap.ClampToEdge;
        page.vWrap = sp.spine.TextureWrap.ClampToEdge;
        page.texture = skeletonTexture;
        page.texture.setWraps(page.uWrap, page.vWrap);
        page.width = texture.width;
        page.height = texture.height;

        let region = new sp.spine.TextureAtlasRegion();
        region.page = page;
        region.name = frame.name;
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

    // 產生新的Region，用來更換新圖片(用Region)
    createRegionByRegion(oldRegion) {
        // let texture = oldRegion.texture._texture; // cc_Texture2D
        let skeletonTexture = oldRegion.texture; // sp_SkeletonTexture
        console.log("createRegionByRegion skeletonTexture：", skeletonTexture);

        // let skeletonTexture = new sp.SkeletonTexture({ width: texture.width, height: texture.height });
        // skeletonTexture.setRealTexture(texture);

        let page = new sp.spine.TextureAtlasPage();
        page.name = oldRegion.name;
        page.uWrap = sp.spine.TextureWrap.ClampToEdge;
        page.vWrap = sp.spine.TextureWrap.ClampToEdge;
        page.texture = skeletonTexture;
        page.texture.setWraps(page.uWrap, page.vWrap);
        // page.width = texture.width;
        // page.height = texture.height;
        page.width = skeletonTexture._image.width;
        page.height = skeletonTexture._image.height;

        let region = new sp.spine.TextureAtlasRegion();
        region.page = page;
        region.name = oldRegion.name;

        region.width = oldRegion.width;
        region.height = oldRegion.height;
        region.x = oldRegion.x;
        region.y = oldRegion.y;
        region.originalWidth = oldRegion.originalWidth;
        region.originalHeight = oldRegion.originalHeight;

        region.rotate = oldRegion.rotate;

        region.u = oldRegion.u;
        region.v = oldRegion.v;
        region.u2 = oldRegion.u2;
        region.v2 = oldRegion.v2;

        region.texture = skeletonTexture;
        return region;
    },

    onClickChangeSkin(event, customEventData) {
        let buttonNode = event.target;
        let labelComponent = buttonNode.getChildByName("Background").getChildByName("Label").getComponent(cc.Label);

        this.targetSpine.setSkin(labelComponent.string);
        this.originSpine.setSkin(labelComponent.string);
    },

    onClickSwitchRegion(event, customEventData) {
        let buttonNode = event.target;
        let functionName = buttonNode.name.split(splitStr)[SplitType.FunctionName];
        let regionName = buttonNode.name.split(splitStr)[SplitType.RegionName];

        this["_" + functionName](regionName);
    },

    onClickDownloadSpine(event, customEventData) {
        let spine_initJS = this.targetSpine.node.getComponent("spine_init");
        spine_initJS.loadResources(function() {
            let buttonNode = event.target;
            buttonNode.opacity = 255;
            buttonNode.active = true;
            
            cc.tween(buttonNode).to(1, {opacity: 0}, { easing: 'cubicOut' })
            .call(function() {
                buttonNode.active = false;
                this._initRegionButton();
                spine_initJS.replaceAllRegion();
            }.bind(this))
            .start();
            
        }.bind(this))
    },

    _changeRegion(regionName) {
        let targetSlot = this.targetSpine.findSlot(regionName);
        let targetAtt = targetSlot.getAttachment();
        // cc.log("test：", targetSlot);

        let textureName = regionName;
        let spriteFrame = this.changeSpriteFrames.find((spriteFrame) => spriteFrame.name == textureName);
        let region = null;
        if (!!spriteFrame) {
            region = this.createRegionBySpriteFrame(spriteFrame);
        } else {
            return false;
        }

        if (typeof (targetAtt.setRegion) == "function") {
            targetAtt.setRegion(region);
            targetAtt.updateOffset();
        } else {
            targetAtt.region = region;
            targetAtt.updateUVs();
        }

        this.node.getChildByName("changeRegion@" + regionName).active = false;
        this.node.getChildByName("recoverRegion@" + regionName).active = true;
    },

    _recoverRegion(regionName) {
        let targetSlot = this.targetSpine.findSlot(regionName);
        let targetAtt = targetSlot.getAttachment();
        let recoverSlot = this.originSpine.findSlot(regionName);
        let recoverRegion = recoverSlot.getAttachment().region;

        let region = this.createRegionByRegion(recoverRegion);
        if (typeof (targetAtt.setRegion) == "function") {
            targetAtt.setRegion(region);
            targetAtt.updateOffset();
        } else {
            targetAtt.region = region;
            targetAtt.updateUVs();
        }
        cc.log("recoverRegion：", region);

        this.node.getChildByName("changeRegion@" + regionName).active = true;
        this.node.getChildByName("recoverRegion@" + regionName).active = false;
    },

    _recoverAttachment(regionName) {
        let targetSlot = this.targetSpine.findSlot(regionName);
        // let targetAtt = targetSlot.getAttachment();
        let recoverSlot = this.originSpine.findSlot(regionName);
        let recoverAtt = recoverSlot.getAttachment();

        targetSlot.setAttachment(recoverAtt);
        cc.log("recoverAttachment：", targetSlot.getAttachment());
    },

    // called every frame
    update: function (dt) {

    },
});
