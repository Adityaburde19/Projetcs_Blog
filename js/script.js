$(function () {
  let currentUser = '', isAdmin = false, editingIndex = null, imageData = '';
  const posts = [], users = [];

  function showView(id) {
    $('.view').removeClass('active');
    $('#' + id).addClass('active');
    $('#nav-login-user, #nav-login-admin').toggle(!currentUser);
    hideForm();
  }

  function hideForm() {
    $('#customModal, #postBackdrop').fadeOut();
    $('#postForm')[0].reset();
    $('.image-preview').empty();
    imageData = '';
    editingIndex = null;
  }

  function buildPostCard(p) {
    const adminButtons = isAdmin
      ? `<div class="admin-controls">
           <button class="btn btn-warning btn-sm edit-post" data-i="${p.id}">Edit</button>
           <button class="btn btn-danger btn-sm delete-post" data-i="${p.id}">Delete</button>
         </div>` : '';
    const imgHtml = p.image ? `<img src="${p.image}" class="blog-img mb-2" />` : '';
    const rating = p.rating ? `<div class="rating">Rating: ${p.rating}/5</div>` : '';
    const comments = p.comments?.length
      ? `<div class="comments"><strong>Comments:</strong> ${p.comments.join('<br>')}</div>`
      : '';
    return `
      <div class="col-md-6 col-lg-4">
        <div class="post">
          <h5>${p.title}</h5>${imgHtml}
          <div>${p.body}</div>
          <div class="meta-info">
            <span>Author: ${p.author}</span><br>
            <span>Category: ${p.category}</span>
          </div>
          ${rating}
          ${comments}
          ${adminButtons}
        </div>
      </div>`;
  }

  function buildFeaturedBlog(p) {
    return `
      <div class="featured-blog">
        <div class="post">
          <img src="${p.image || 'https://via.placeholder.com/300x200'}" class="blog-img" />
          <div class="post-content">
            <h5>${p.title}</h5>
            <div class="meta-info">
              <span><strong>Author:</strong> ${p.author}</span><br>
              <span><strong>Category:</strong> ${p.category}</span>
            </div>
            <p class="mt-3">${p.body.substring(0, 150)}...</p>
            ${p.rating ? `<div class="rating">Rating: ${p.rating}/5</div>` : ''}
            ${p.comments?.length ? `<div class="comments"><strong>Comments:</strong> ${p.comments.join('<br>')}</div>` : ''}
            <div class="read-more">Continue reading...</div>
          </div>
        </div>
      </div>`;
  }

  function renderPosts() {
    const trending = posts.filter(p => p.rating >= 4 || (p.comments?.length >= 2));
    const sortedTrending = trending.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    const featured = sortedTrending[0];

    // Featured Blog Section
    $('#trending-posts').html(
      featured ? buildFeaturedBlog(featured) : '<p>No featured blog available.</p>'
    );

    // Top 2 Remaining Trending Posts
    const restTrending = sortedTrending.slice(1, 3);
    $('#trending-posts').append(`<div class="post-grid row g-4">${restTrending.map(buildPostCard).join('')}</div>`);

    // Category-wise Blog Sections
    const cats = ["Lifestyle", "Political", "Sports", "Fitness", "Technology", "Business", "News"];
    $('#category-blogs').empty();
    cats.forEach(cat => {
      const filtered = posts.filter(p => p.category === cat);
      if (filtered.length) {
        const section = `
          <div class="mb-4">
            <h3 id="${cat}">${cat}</h3>
            <div class="post-grid row g-4">${filtered.map(buildPostCard).join('')}</div>
          </div>`;
        $('#category-blogs').append(section);
      }
    });

    // Admin View
    if (isAdmin) {
      $('#view-admin-panel .post-grid').html(posts.map(buildPostCard).join(''));
    } 
    // User View
    else if (currentUser) {
      $('#view-user-panel .post-grid').html(
        posts.filter(p => p.author === currentUser).map(buildPostCard).join('')
      );
    }
  }

  function updateWeatherAndDate() {
    const now = new Date();
    const day = now.toLocaleDateString('en-US', {weekday:'long',year:'numeric',month:'short',day:'numeric'});
    const time = now.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
    const temp = 28 + Math.floor(Math.random()*6);
    const icons = ['☀️','🌤️','⛅','🌧️','🌦️'];
    $('#weather-date').text(`${day} | ${time} | ${icons[Math.floor(Math.random()*icons.length)]} ${temp}°C`);
  }

  setInterval(updateWeatherAndDate, 60000);
  updateWeatherAndDate();

  $('#user-login-btn').click(() => {
    const u = $('#user-name').val().trim();
    if (!u) return;
    currentUser = u; isAdmin = false;
    if (!users.includes(u)) users.push(u);
    $('#u-name').text(u);
    showView('view-user-panel');
    renderPosts();
  });

  $('#admin-login-btn').click(() => {
    if ($('#admin-pass').val() !== 'admin123') return alert('Wrong key!');
    currentUser = 'Admin'; isAdmin = true;
    $('#user-list').html(users.map(u => `<li class="list-group-item">${u}</li>`));
    showView('view-admin-panel');
    renderPosts();
  });

  $('#btn-logout-user, #btn-logout-admin').click(() => {
    currentUser = ''; isAdmin = false;
    location.hash = 'home';
    showView('view-home');
  });

  $('#btn-new-post-user, #btn-new-post-admin').click(() => {
    editingIndex = null;
    $('#form-title').text('New Blog');
    $('#customModal, #postBackdrop').fadeIn();
  });

  $('#cancel-post, #closeModal, #postBackdrop').click(hideForm);

  $('#blog-image').change(function () {
    const f = this.files[0];
    if (!f?.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => {
      imageData = e.target.result;
      $('.image-preview').html(`<img src="${imageData}" />`);
    };
    reader.readAsDataURL(f);
  });

  $('#postForm').submit(e => {
    e.preventDefault();
    const post = {
      id: editingIndex ?? Date.now(),
      title: $('#blog-title').val().trim(),
      body: $('#blog-body').val().trim(),
      category: $('#post-category').val(),
      author: currentUser,
      image: imageData || '',
      comments: $('#blog-comments').val().split('\n').filter(Boolean),
      rating: parseInt($('#blog-rating').val()) || null
    };
    const idx = posts.findIndex(p => p.id === post.id);
    idx >= 0 ? posts[idx] = post : posts.push(post);
    renderPosts();
    hideForm();
  });

  $(document).on('click', '.delete-post', function () {
    const id = +$(this).data('i');
    const idx = posts.findIndex(p => p.id === id);
    if (idx >= 0) posts.splice(idx, 1);
    renderPosts();
  });

  $(document).on('click', '.edit-post', function () {
    const id = +$(this).data('i');
    const p = posts.find(p => p.id === id);
    if (p) {
      editingIndex = id;
      $('#form-title').text('Edit Blog');
      $('#post-category').val(p.category);
      $('#blog-title').val(p.title);
      $('#blog-body').val(p.body);
      $('#blog-comments').val(p.comments.join('\n'));
      $('#blog-rating').val(p.rating);
      imageData = p.image;
      $('.image-preview').html(p.image ? `<img src="${p.image}" />` : '');
      $('#customModal, #postBackdrop').fadeIn();
    }
  });

  function routeBasedView() {
    const hash = location.hash.replace('#','view-') || 'view-home';
    showView(hash);
  }

  $(window).on('hashchange', routeBasedView);
  $('#nav-login-user').click(() => location.hash = 'user-login');
  $('#nav-login-admin').click(() => location.hash = 'admin-login');
  $('.sub-header a[href="#home"]').click(() => location.hash = 'home');

  routeBasedView();
  renderPosts();
});
