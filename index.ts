import config from '../../config';

// DOMUSTO
import DomustoPlugin from '../../domusto/DomustoPlugin';

// INTERFACES
import { Domusto } from '../../domusto/DomustoTypes';
import DomustoSignalHub from '../../domusto/DomustoSignalHub';
import DomustoDevicesManager from '../../domusto/DomustoDevicesManager';

// PLUGIN SPECIFIC
let hue = require('node-hue-api');
let HueApi = hue.HueApi;
let lightState = hue.lightState;

/**
 * GPIO plugin for DOMUSTO
 * @author Bas van Dijk
 * @version 0.0.1
 *
 * @class DomustoPhilipsHue
 * @extends {DomustoPlugin}
 */
class DomustoPhilipsHue extends DomustoPlugin {

    /**
     * Creates an instance of DomustoPhilipsHue.
     * @param {any} Plugin configuration as defined in the config.js file
     * @memberof DomustoPhilipsHue
     */
    constructor(pluginConfiguration: Domusto.PluginConfiguration) {

        super({
            plugin: 'Philips HUE controller',
            author: 'Bas van Dijk',
            category: Domusto.PluginCategories.system,
            version: '0.0.1',
            website: 'http://domusto.com'
        });

        this.pluginConfiguration = pluginConfiguration;

        const isConfigurationValid = this.validateConfigurationAttributes(pluginConfiguration.settings, [
            {
                attribute: 'ip',
                type: /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/
            },
            {
                attribute: 'username',
                type: 'string'
            },
        ]);

        if (isConfigurationValid) {

            // Initialize hardware plugin
            const philipsHue = new HueApi(pluginConfiguration.settings.ip, pluginConfiguration.settings.username);
            this.hardwareInstance = philipsHue;

            // Poll current Philips HUE status
            setTimeout(() => {
                this.refreshPhilipsHueStatus();
            }, 100);

            // // Start polling receiver on interval
            // setInterval(() => this.refreshReceiverStatus(), pluginConfiguration.settings.pollInterval | 10000);

            this.console.header(`${pluginConfiguration.id} plugin ready for sending / receiving data`);

        }

    }

    /**
     * Fired when a signal is send to the plugin
     *
     * @param {Domusto.Signal} signal
     * @memberof DomustoPhilipsHue
     */
    onSignalReceivedForPlugin(signal: Domusto.Signal) {

        if (this.isLight(signal.deviceId)) {
            this.setLightStatus(signal.deviceId, signal.data['state']);
        } else if (this.isGroup(signal.deviceId)) {
            this.setGroupStatus(signal.deviceId, signal.data['state']);
        }

    }

    refreshPhilipsHueStatus() {

        let devices = DomustoDevicesManager.getDevicesByPluginId(this.pluginConfiguration.id);

        for (let device of devices) {

            if (this.isLight(device.plugin.deviceId)) {
                this.getLightStatus(device.plugin.deviceId);
            } else if (this.isGroup(device.plugin.deviceId)) {
                this.getGroupStatus(device.plugin.deviceId);
            }

        }

    }

    setLightStatus(lightId, state) {

        let hueState = lightState.create();

        if (state === 'on') {
            this.hardwareInstance.setLightState(lightId.substr(1), hueState.on()).then(res => {
                this.broadcastSignal(lightId, {
                    state: 'on'
                });
            });
        } else if (state === 'off') {
            this.hardwareInstance.setLightState(lightId.substr(1), hueState.off()).then(res => {
                this.broadcastSignal(lightId, {
                    state: 'off'
                });
            });
        }

    }

    setGroupStatus(groupId, state) {

        let hueState = lightState.create();

        if (state === 'on') {
            this.hardwareInstance.setGroupLightState(groupId.substr(1), hueState.on()).then(res => {
                this.broadcastSignal(groupId, {
                    state: 'on'
                });
            });
        } else if (state === 'off') {
            this.hardwareInstance.setGroupLightState(groupId.substr(1), hueState.off()).then(res => {
                this.broadcastSignal(groupId, {
                    state: 'off'
                });
            });
        }

    }

    getLightStatus(lightId) {

        this.console.log('Getting status for light', lightId);

        this.hardwareInstance.lightStatus(lightId.substr(1)).then(displayStatus => {
            this.broadcastSignal(lightId, {
                state: displayStatus ? 'on' : 'off'
            });
        });

    }

    getGroupStatus(groupId) {

        this.console.log('Getting status for group', groupId);

        this.hardwareInstance.getGroup(groupId).then(displayResults => {
            this.broadcastSignal(groupId, {
                state: displayResults.lastAction.on ? 'on' : 'off'
            });
        });
    }

    private isLight(deviceId) {
        return deviceId[0] === 'L';
    }

    private isGroup(deviceId) {
        return deviceId[0] === 'G';
    }

}

export default DomustoPhilipsHue;