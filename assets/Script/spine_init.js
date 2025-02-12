// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        // 每次設定SKIN，就要再把圖片換上去(?
        this.skeleton = this.node.getComponent(sp.Skeleton);
        let spineName = this.skeleton.skeletonData.name;
        this.skinNames = Object.keys(this.skeleton.skeletonData.skeletonJson.skins);
        this.skinSlotNames = [];
        this.downloadPath = "Texture/spine_textures/" + spineName;
        // 對應圖片路徑的map
        this.textureMap = new Map();

        // this.startTime = new Date();
        // 要更換的初始圖檔素材
        this._defaultSpriteFrames = [];

        // 整理spine動畫，會用到的skins內slots
        this._initTextureInfo();

        // 整理圖檔路徑
        this._initTextureMap();

        // 下載圖片資源包
        this.loadResources(this.replaceAllRegion.bind(this));
        // this.loadResources(this.loadResources2.bind(this));
        // this.loadResources2();
        window.testSpine = this.skeleton;
    },

    start() { },

    _initTextureInfo() {
        this.skinNames.forEach((element) => {
            // console.log("哈哈是我啦 查看skin " + element + "：");
            // cc.log(this.skeleton.skeletonData.skeletonJson.skins[element]);

            let skinName = element;
            let slotNames = Object.keys(
                this.skeleton.skeletonData.skeletonJson.skins[skinName]
            );
            cc.log(slotNames);

            this.skinSlotNames[skinName] = slotNames;

        });

        cc.log("this.skinSlotNames:");
        cc.log(this.skinSlotNames);
    },

    _initTextureMap() {
        // let infos = cc.resources.getDirWithPath(this.downloadPath, cc.Texture2D);
        let infos = cc.resources.getDirWithPath(this.downloadPath, cc.SpriteFrame);
        let paths = infos.map(function (info) {
            return info.path;
        });
        // cc.log("圖片路徑：");
        // cc.log(paths);

        paths.forEach((element) => {
            let key = typeof (element) == "string" ? element.replace(this.downloadPath + "/", "") : "";
            let tmpSplits = key.split("/");
            // let value = tmpSplits[tmpSplits.length - 1];
            let name = tmpSplits[tmpSplits.length - 1];
            let region = this.skeleton.skeletonData._atlasCache.regions.find(function (item) {
                return item.name == key;
            })
            // value 由圖片名稱和 skeletonData._atlasCache.regions 中的region所組成
            let value = {
                "name": name,
                "region": region
            };
            this.textureMap.set(key, value);
        })
        cc.log("textureMap：")
        cc.log(this.textureMap)
    },

    _findSlotIndex(slotName) {
        return this.skeleton.skeletonData._skeletonCache.findSlotIndex(slotName)
    },

    loadResources(cb) {
        // let spineName = this.skeleton.skeletonData.name;
        // let downloadPath = "Texture/spine_textures/" + spineName;
        this.startTime = new Date();

        cc.resources.loadDir(
            this.downloadPath,
            // "Texture/test",
            cc.SpriteFrame,
            function (err, assets) {
                this._defaultSpriteFrames = assets;
                window._defaultSpriteFrames = this._defaultSpriteFrames;
                if (cb != undefined && cb != null) {
                    cb();
                }
                let endTime = new Date();
                let timeDiff = (endTime - this.startTime) / 1000;
                console.log("loadResources幾秒：" + timeDiff)
            }.bind(this)
        );
    },

    loadResources2(cb) {
        // let spineName = this.skeleton.skeletonData.name;
        // let downloadPath = "Texture/spine_textures/" + spineName;
        this.startTime = new Date();

        cc.resources.loadDir(
            // this.downloadPath,
            "Texture/test",
            cc.SpriteFrame,
            function (err, assets) {
                // this._defaultSpriteFrames = assets;
                // window._defaultSpriteFrames = this._defaultSpriteFrames;
                if (cb != undefined && cb != null) {
                    cb();
                }
                let endTime = new Date();
                let timeDiff = (endTime - this.startTime) / 1000;
                console.log("loadResources2幾秒：" + timeDiff)
            }.bind(this)
        );
    },

    replaceAllRegion() {
        cc.log("哈哈是我啦");
        cc.log(this._defaultSpriteFrames);
        // this.startTime = new Date();

        let skins = this.skeleton.skeletonData._skeletonCache.skins;
        skins.forEach(function (skin) { // 各皮膚
            // if (skin.name == "symbol_04") {
            cc.log("哭阿：",this.skinSlotNames[skin.name]);
            cc.log("skin：",skin);
            this.skinSlotNames[skin.name].forEach(function (slotName) { // 皮膚底下各個Slots
                let slotIndex = this._findSlotIndex(slotName);
                let atts = Object.values(skin.attachments[slotIndex]);

                atts.forEach(function (att) { // 每個Slots裡的attachment
                    let textureName = this.textureMap.get(att.path).name;
                    let oldRegion = this.textureMap.get(att.path).region;
                    cc.log("textureName:", textureName);

                    let region = this.createRegion(this._defaultSpriteFrames.find((spriteFrame) => spriteFrame.name == textureName), oldRegion);
                    // att.region = region;

                    if (typeof (att.setRegion) == "function") {
                        // if (att.constructor.name == "RegionAttachment") {
                        att.setRegion(region);
                        att.updateOffset();
                        // } else if (att.constructor.name == "MeshAttachment") {
                    } else {
                        att.region = region;
                        att.updateUVs();
                    }

                }.bind(this))
            }.bind(this))
            // }
        }.bind(this))

        // let endTime = new Date();
        // let timeDiff = (endTime - this.startTime) / 1000;
        // console.log("幾秒：" + timeDiff)
    },

    // 產生新的Region，用來更換新圖片
    createRegion(frame, oldRegion) {
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

    replaceRegionTexture(textureName, region) {
        // let spriteFrame = this._defaultSpriteFrames.find((spriteFrame) => spriteFrame.name == textureName);
        // let texture = spriteFrame.getTexture();

        // let skeletonTexture = new sp.SkeletonTexture({ width: att.region.width, height: att.region.height });
        // skeletonTexture.setRealTexture(texture);
        // // att.region.x = null;
        // // att.region.y = null;
        // att.region.u = 0;
        // att.region.v = 0;
        // att.region.u2 = 1;
        // att.region.v2 = 1;
        // att.region.rotate = false;
        // att.region.texture = skeletonTexture;
    }

    // update (dt) {},
});
