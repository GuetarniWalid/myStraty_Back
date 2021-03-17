'use strict'
const User = use('App/Models/User')

/**
 * @memberof Controllers.Http
 * @classDesc This is the Controller for routes that begin by "[Domain name]/api/v1/settings". Desserve data related to settings.
 */
class SettingController {

    /**
     * @description Gives all settings user
     * @param {ctx} ctx - Context object 
     * @param {number|string} ctx.auth.user.id - User's id
     * @returns {settings} - Settings data
     */
    async get({auth}) {
        const userId = auth.user.id
        const user = await User.find(userId)
        const settings = await user.setting().fetch()
        return settings
    }

    /**
     * @description - save user settings in database
     * @param {ctx} ctx - Context object 
     * @param {number|string} ctx.auth.user.id - User's id
     * @param {boolean} [ctx.request.darkMode] - If darkMode must be active
     * @param {boolean} [ctx.request.sendMail] - If sendMail must be active
     * @param {string} [ctx.request.mailTime] - The time at which the email should be sent
     * @returns {object<success>}
     */
    async post({auth, request}) {
        try {
            const userId = auth.user.id
            const user = await User.find(userId)
            const settings = await user.setting().fetch()
            if(request.post().darkMode !== undefined) {
                settings.dark_mode = request.post().darkMode
            }
            if(request.post().sendMail !== undefined) {
                settings.send_mail = request.post().sendMail
            }
            if(request.post().mailTime !== undefined) {
                const time = request.post().mailTime             
                settings.mail_time = request.post().mailTime
            }
            await settings.save()
    
            return {success: true}
        }
        catch(e) {
            return {success: false}
        }
    }
}

module.exports = SettingController
