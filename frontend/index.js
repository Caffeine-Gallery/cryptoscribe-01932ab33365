import { backend } from "declarations/backend";

let quill;

document.addEventListener('DOMContentLoaded', async () => {
    initQuill();
    setupEventListeners();
    await loadPosts();
});

function initQuill() {
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                ['link', 'image'],
                ['clean']
            ]
        }
    });
}

function setupEventListeners() {
    const modal = document.getElementById('newPostForm');
    const btn = document.getElementById('newPostBtn');
    const span = document.getElementsByClassName('close')[0];
    const form = document.getElementById('postForm');

    btn.onclick = () => modal.classList.add('show');
    span.onclick = () => modal.classList.remove('show');
    
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    };

    form.onsubmit = async (e) => {
        e.preventDefault();
        await submitPost();
    };
}

async function submitPost() {
    const loading = document.getElementById('loading');
    const modal = document.getElementById('newPostForm');
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const content = quill.root.innerHTML;

    try {
        loading.classList.remove('hidden');
        await backend.createPost(title, content, author);
        
        document.getElementById('postForm').reset();
        quill.setContents([]);
        modal.classList.remove('show');
        
        await loadPosts();
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Failed to create post. Please try again.');
    } finally {
        loading.classList.add('hidden');
    }
}

async function loadPosts() {
    const loading = document.getElementById('loading');
    const postsContainer = document.getElementById('posts');

    try {
        loading.classList.remove('hidden');
        const posts = await backend.getPosts();
        
        postsContainer.innerHTML = posts.reverse().map(post => `
            <article class="post">
                <h2 class="post-title">${post.title}</h2>
                <div class="post-meta">
                    By ${post.author} • ${new Date(Number(post.timestamp) / 1000000).toLocaleDateString()}
                </div>
                <div class="post-content">
                    ${post.content}
                </div>
            </article>
        `).join('');
    } catch (error) {
        console.error('Error loading posts:', error);
        postsContainer.innerHTML = '<p>Failed to load posts. Please refresh the page.</p>';
    } finally {
        loading.classList.add('hidden');
    }
}
