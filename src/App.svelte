<script>
    import { onMount } from 'svelte';
    import { Router, Route, link } from 'svelte-routing';
    import { userData } from './stores/metadataStore';

    import Home from './pages/Home.svelte';
    import Profile from './pages/Profile.svelte';
    import Settings from './pages/Settings.svelte';
    import Drip from './pages/Drip.svelte';
	import Templates from './pages/Templates.svelte';

    export let url = '';

    let userdata = {};

    onMount(async () => userdata = await userData());
    const toggleusermenu = () => jQuery(".usermenu").slideToggle();

	// Load Discord image as fallback if avatar is not available
    const loadgeneric = () => useravatar.src = "/css/img/discord.png";

	const setTemplate = (id) => {
		userdata.template = id;
	}
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
					<img src="{userdata.avatar}" id="useravatar" on:click={toggleusermenu} on:error={loadgeneric} alt="avatar" />
				</div>
				<a class="btn btn-primary" href="/" role="button" use:link>Home</a>
				<a class="btn btn-primary" href="/p/{userdata.profileId}" role="button" use:link>Profile</a>
				<a class="btn btn-primary" href="/templates" role="button" use:link>Templates</a>
            {/if}
		</div>
        <Router {url}>
            <Route path="/templates" component={Templates} {userdata} {setTemplate} />
            <Route path="/drip" component={Drip} {userdata} />
            <Route path="/settings" component={Settings} {userdata} />
            <Route path="/p/:profileId" component={Profile} />
            <Route path="*" component={Home} {userdata} />
        </Router>
		{#if !userdata.id}
		<div class="nameentry needtologin">
			<a id="loginDiscord" href={userdata.loginUrl}>
				<button class="btn btn-primary" type="button">Discord Login</button>
			</a>
		</div>
		{/if}
	</div>
</main>

<style></style>
