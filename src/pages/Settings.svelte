<script>
    import { onMount } from 'svelte';

    import { getSettings, saveBotKeyConfig, resetKeyConfig, revokeKeyConfig } from '../stores/settingsStore';

    export let userdata = {};
    export let location = "";

    let settings = {},
        copyInput;

    onMount(async () => {
        settings = await getSettings();
    });

    function copyToClipboard() {
        console.log("going");
        copyInput.focus();
        copyInput.select();
        document.execCommand("copy");
    }

    async function saveRow(id) {
        const botConfig = settings.allbots.filter(t => t.userId === id)[0];
        await saveBotKeyConfig(botConfig);
        window.location.href = window.location.href;
    }

    async function resetKey(id) {
        await resetKeyConfig(id);
        window.location.href = window.location.href;
    }

    async function revokeKey(id) {
        await revokeKeyConfig(id);
        window.location.href = window.location.href;
    }
</script>

<div class="container">
    {#if settings.isAdmin}
        <div class="row">
            <div class="col">
                <form action="/api/settings/grantkey" method="post" id="save-form">
                    <div class="form-group">
                        <div>
                            <h3 for="name">Grant bot key to another user</h3>
                            <input type="text" class="form-control" name="name" value="" id="name" placeholder="User ID" />
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="getProfile" name="permissions" style="width:auto">
                            <label class="form-check-label" for="flexCheckDefault">
                                Get Profile
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="saveFriendCode" name="permissions" style="width:auto">
                            <label class="form-check-label" for="flexCheckDefault">
                                Save Friend Code
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="saveUsername" name="permissions" style="width:auto">
                            <label class="form-check-label" for="flexCheckDefault">
                                Save Username
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="saveDrip" name="permissions" style="width:auto">
                            <label class="form-check-label" for="flexCheckDefault">
                                Save Drip
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="deleteProfile" name="permissions" style="width:auto">
                            <label class="form-check-label" for="flexCheckDefault">
                                Delete Profile
                            </label>
                        </div>
                        <button id="submit" type="submit" class="btn btn-primary">Save</button>
                    </div>
                </form>
            </div>
        </div>
        <div class="row no-gutters" style="margin-top:14px;">
            <div class="col">
                <div class="container" style="padding:0">
                    <div class="row no-gutters">
                        <div class="col">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th scope="col">User</th>
                                        <th scope="col">Get Profile</th>
                                        <th scope="col">Save FC</th>
                                        <th scope="col">Save Name</th>
                                        <th scope="col">Save Drip</th>
                                        <th scope="col">Delete Profile</th>
                                        <th scope="col">Team Query</th>
                                        <th scope="col">Team Webhook</th>
                                        <th scope="col">Revoked</th>
                                        <th scope="col">Update</th>
                                        <th scope="col">Reset</th>
                                        <th scope="col">Revoke</th>
                                      </tr>
                                </thead>
                                <tbody>
                                    {#if settings.allbots && settings.allbots.length}
                                    {#each settings.allbots as bot}
                                    <tr>
                                        <th scope="row">
                                            {bot.userId}
                                            <input type="hidden" name="name" value={bot.userId} />
                                        </th>
                                        <td>
                                            <div class="form-check">
                                                <input type="hidden" name="getProfile" value="0" />
                                                <input class="form-check-input" type="checkbox" value="1" name="getProfile" style="width:auto" bind:checked={bot.getProfile}>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="form-check">
                                                <input type="hidden" name="saveFriendCode" value="0" />
                                                <input class="form-check-input" type="checkbox" value="1" name="saveFriendCode" style="width:auto" bind:checked={bot.saveFriendCode}>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="form-check">
                                                <input type="hidden" name="saveUsername" value="0" />
                                                <input class="form-check-input" type="checkbox" value="1" name="saveUsername" style="width:auto" bind:checked={bot.saveUsername}>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="form-check">
                                                <input type="hidden" name="saveDrip" value="0" />
                                                <input class="form-check-input" type="checkbox" value="1" name="saveDrip" style="width:auto" bind:checked={bot.saveDrip}>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="form-check">
                                                <input type="hidden" name="deleteProfile" value="0" />
                                                <input class="form-check-input" type="checkbox" value="1" name="deleteProfile" style="width:auto" bind:checked={bot.deleteProfile}>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="form-check">
                                                <input type="hidden" name="teamQuery" value="0" />
                                                <input class="form-check-input" type="checkbox" value="1" name="teamQuery" style="width:auto" bind:checked={bot.teamQuery}>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="form-check">
                                                <input type="hidden" name="teamWebhook" value="0" />
                                                <input class="form-check-input" type="checkbox" value="1" name="teamWebhook" style="width:auto" bind:checked={bot.teamWebhook}>
                                            </div>
                                        </td>
                                        <td>
                                            {bot.nobot}
                                        </td>
                                        <td>
                                            <button class="btn btn-primary" type="button" on:click={async () => await saveRow(bot.userId)}><i class="fa fa-cloud-upload"></i></button>
                                        </td>
                                        <td class="text-center">
                                            <button class="btn btn-primary" type="button" on:click={async () => await resetKey(bot.userId)}><i class="fa fa-refresh"></i></button>
                                        </td>
                                        <td class="text-center">
                                            <button class="btn btn-primary" type="button" on:click={async () => await revokeKey(bot.userId)}><i class="fa fa-times"></i></button>
                                        </td>
                                    </tr>
                                    {/each}
                                    {/if} 
                                </tbody>
                              </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {/if}
    {#if settings.botKey}
        <div class="row" style="margin-top:14px;">
            <div class="col-11">
                <form>
                    <label for="copy-input">Your Bot Key</label>
                    <div class="input-group" onclick="copyToClipboard()">
                          <input type="text" class="form-control"
                              value={settings.botKey} id="copy-input" bind:this={copyInput} readonly>
                          <span class="input-group-btn">
                            <button class="btn btn-default" type="button" id="copy-button"
                                data-toggle="tooltip" data-placement="button"
                                title="Copy to Clipboard">
                                  <i class="fa fa-copy"></i>
                            </button>
                          </span>
                    </div>
                </form>
            </div>
            <div class="col-1">
                <form action="/settings/resetkey" method="post">
                    <button class="btn btn-primary" type="submit" style="bottom:4px;position:absolute;"><i class="fa fa-refresh"></i></button>
                </form>
            </div>
        </div>
        {#if settings.teamWebhookAllowed}
            <form action="/api/settings/saveteamwebhook" method="post" id="save-form">
                <div class="row" style="margin-top:14px;">
                        <div class="col">
                            <label for="copy-input">Team Webhook</label>
                            <input type="text" class="form-control" name="webhook" value={settings.teamWebhookUrl} id="webhook" placeholder="Your webhook URL" />
                        </div>
                </div>
                <div class="row" style="margin-top:14px;">
                    <div class="col">
                        <button class="btn btn-primary" type="submit" style="float:right;">Save Webhook</button>
                    </div>
                </div>
            </form>
        {/if}
    {/if}
</div>