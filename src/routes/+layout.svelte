<!-- <script>
	import favicon from '$lib/assets/favicon.svg';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()} -->


<script>
  import '../app.css';
  import favicon from '$lib/assets/favicon.svg';
  
  let { children } = $props();
</script>

<div class="min-h-screen bg-red-550 text-white antialiased">
  {@render children()}
</div>
