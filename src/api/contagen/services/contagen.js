'use strict';

/**
 * contagen service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::contagen.contagen');