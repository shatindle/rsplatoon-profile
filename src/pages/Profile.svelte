<script>
    import { onMount } from 'svelte';

    import { getProfile } from '../stores/profileStore';

    export let profileId = "";
    export let location = "";

    let profile = {};

    onMount(async () => {
        profile = await getProfile(profileId);
    })

    let copyInput;

    function copyToClipboard() {
        console.log("going");
        copyInput.focus();
        copyInput.select();
        document.execCommand("copy");
    }
</script>

<div class="container">
    <div class="row" style="margin-bottom: 14px;">
        <div class="col">
            <h3>{profile.name ? profile.name : 'User'}'s Profile</h3>
        </div>
    </div>
    <div class="row" style="margin-bottom: 14px;">
        <div class="col-12 col-md-6">
            {#if profile.drip}
                <div>
                    <h3>Their drip</h3>
                </div>
                <img src={profile.drip} class="drip-pic" alt="drip" />
            {:else}
                <div>
                    <h3>No drip</h3>
                </div>
                <img src="/css/img/nodrip.png" class="drip-pic" alt="no drip" />
            {/if}
        </div>
        <div class="col-12 col-md-6">
            <form>
                <h3 for="copy-input">Friend Code</h3>
                <div class="input-group" on:click={copyToClipboard}>
                      <input type="text" class="form-control"
                          value={profile.friendCode} id="copy-input" bind:this={copyInput} readonly>
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
    </div>
</div>