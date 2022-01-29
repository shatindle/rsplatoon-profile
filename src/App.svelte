<script>
    import { onMount } from 'svelte';
    import { Router, Route } from 'svelte-routing';
    import { userData } from './stores/metadataStore';

    import Home from './pages/Home.svelte';
    import Profile from './pages/Profile.svelte';
    import Settings from './pages/Settings.svelte';
    import Drip from './pages/Drip.svelte';

    export let url = '';
    
    let userdata = {};

    onMount(async () => userdata = await userData());
    const toggleusermenu = () => jQuery(".usermenu").slideToggle();
</script>

<main>
	<div class="container" style="margin-bottom:100px;padding-left:0;padding-right:0;">
		<div class="jumbotron">
			<div>
				<a href="https://discord.gg/rsplatoon" target="_blank">
					<img class="center-block" src="/css/img/logo.png" style="width:300px;height:auto;margin-top:0" alt="logo" />
				</a>
				<h1>Profile</h1>
			</div>
            {#if userdata.id}
				<div id="userinfo">
					<div class="usermenu" style="display: none;">
						<div style="height:70px;width:1px;"></div>
						<div class="item">
							<a href="/settings">
								Settings
							</a>
						</div>
						<div class="item">
							<form action="/api/delete" method="post">
								<input type="hidden" name="delete" value="YES" />
								<a href="/" onclick="$(this).closest('form').submit();return false;">
									Delete Profile
								</a>
							</form>
						</div>
						<div class="item">
							<a href="/logout">
								Logout
							</a>
						</div>
					</div>
					<img src="{userdata.avatar}" on:click={toggleusermenu} alt="avatar" />
				</div>
            {/if}
			<a class="btn btn-primary" href="/" role="button">Home</a>
		</div>
        <Router {url}>
            <Route path="/drip" component={Drip} {userdata} />
            <Route path="/settings" component={Settings} {userdata} />
            <Route path="/p/:profileId" component={Profile} />
            <Route path="*" component={Home} {userdata} />
        </Router>
	</div>
</main>

<style></style>