'use strict';
const db = require('../../../database/db.js');

module.exports = app => {
  const merchantSchema = require('../../schema/merchant.js')(app);
  const Merchant = db.defineModel(app, 'merchant', merchantSchema);

  /**
   * 新增商家
   * @param {Object} merchant 条件
   * @return {String} 商家uuid
   */
  Merchant.saveNew = async merchant => {
    await Merchant.create(merchant);
    return merchant.uuid;
  };

  /**
   * 修改商家
   * @param {Object} merchant 条件
   * @return {String} 商家uuid
   */
  Merchant.saveModify = async merchant => {
    const {
      uuid, name, enableStatus, servicePhone, linkPhone, appId, appSecret, mchId,
      mchKey, linkMan, version, password, lastModifierId, lastModifierName,
    } = merchant;
    const updateField = {
      version, name, enableStatus, servicePhone, appId, appSecret, mchId,
      mchKey, linkPhone, linkMan, lastModifierId, lastModifierName,
    };

    if (password) {
      updateField.password = password;
    }

    const result = await Merchant.update(updateField, { where: { uuid, version: version - 1 } });

    app.checkUpdate(result);

    return uuid;
  };

  /**
   * 修改商家密码
   * @param {Object} params 条件
   * @return {String} 商家uuid
   */
  Merchant.savePasswordModify = async params => {
    const { uuid, oldPassword, password, lastModifierId, lastModifierName } = params;
    const updateField = { password, lastModifierId, lastModifierName };
    const result = await Merchant.update(updateField, { where: { uuid, password: oldPassword } });

    app.checkUpdate(result, '旧密码不正确');

    return uuid;
  };

  /**
   * 查询商家分页列表
   * @param {Object} { attributes, pagination, filter } 条件
   * @return {Object|Null} 查找结果
   */
  Merchant.query = async ({ userUuid, attributes, pagination = {}, filter = {} }) => {
    const { page, pageSize: limit } = pagination;
    const { count, rows } = await Merchant.findAndCountAll({
      offset: (page - 1) * limit,
      limit,
      attributes,
      where: { ...filter, orgUuid: userUuid },
      order: [['createdTime', 'DESC']],
    });

    return { page, count, rows };
  };

  /**
   * 根据uuid获取商家
   * @param {Object} { pagination, filter } 条件
   * @return {Object|Null} 查找结果
   */
  Merchant.get = async ({ uuid, attributes }) => {
    const merchant = await Merchant.findById(uuid, {
      attributes,
    });

    return merchant;
  };

  return Merchant;
};

