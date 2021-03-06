'use strict';
const CONST = require('../CONST');
const navigationService = require('../services/navigation.service.js');
const notifyStore = require('../services/notify.store.js');

module.exports = {
    init: function () {
        return new Vue({
            el: '.state_list',
            data: {
                notifications: []
            },
            ready: function () {
                const storedNotifications = localStorage.getItem(CONST.NOTIFICATIONS_STORAGE);

                if(storedNotifications) {
                    this.$set('notifications', JSON.parse(storedNotifications));
                }
            },

            methods: {
                toMainState: function () {
                    navigationService.go('MAIN');
                },

                init: function () {
                    const storedNotifications = notifyStore.getNotifications();

                    if(storedNotifications) {
                        this.$set('notifications', JSON.parse(storedNotifications));
                    }
                }
            }
        });
    }
};
