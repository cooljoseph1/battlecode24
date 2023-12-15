"use strict";
// automatically generated by the FlatBuffers compiler, do not modify
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalUpgradeMetadata = void 0;
var flatbuffers = require("flatbuffers");
var global_upgrade_type_1 = require("../../battlecode/schema/global-upgrade-type");
var GlobalUpgradeMetadata = /** @class */ (function () {
    function GlobalUpgradeMetadata() {
        this.bb = null;
        this.bb_pos = 0;
    }
    GlobalUpgradeMetadata.prototype.__init = function (i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    };
    GlobalUpgradeMetadata.getRootAsGlobalUpgradeMetadata = function (bb, obj) {
        return (obj || new GlobalUpgradeMetadata()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    };
    GlobalUpgradeMetadata.getSizePrefixedRootAsGlobalUpgradeMetadata = function (bb, obj) {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new GlobalUpgradeMetadata()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    };
    GlobalUpgradeMetadata.prototype.type = function () {
        var offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : global_upgrade_type_1.GlobalUpgradeType.ACTION_UPGRADE;
    };
    GlobalUpgradeMetadata.prototype.upgradeAmount = function () {
        var offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
    };
    GlobalUpgradeMetadata.startGlobalUpgradeMetadata = function (builder) {
        builder.startObject(2);
    };
    GlobalUpgradeMetadata.addType = function (builder, type) {
        builder.addFieldInt8(0, type, global_upgrade_type_1.GlobalUpgradeType.ACTION_UPGRADE);
    };
    GlobalUpgradeMetadata.addUpgradeAmount = function (builder, upgradeAmount) {
        builder.addFieldInt32(1, upgradeAmount, 0);
    };
    GlobalUpgradeMetadata.endGlobalUpgradeMetadata = function (builder) {
        var offset = builder.endObject();
        return offset;
    };
    GlobalUpgradeMetadata.createGlobalUpgradeMetadata = function (builder, type, upgradeAmount) {
        GlobalUpgradeMetadata.startGlobalUpgradeMetadata(builder);
        GlobalUpgradeMetadata.addType(builder, type);
        GlobalUpgradeMetadata.addUpgradeAmount(builder, upgradeAmount);
        return GlobalUpgradeMetadata.endGlobalUpgradeMetadata(builder);
    };
    return GlobalUpgradeMetadata;
}());
exports.GlobalUpgradeMetadata = GlobalUpgradeMetadata;