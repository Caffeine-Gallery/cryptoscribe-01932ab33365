import Text "mo:base/Text";

import Time "mo:base/Time";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";

actor {
    // Define the Post type
    public type Post = {
        title: Text;
        content: Text;
        author: Text;
        timestamp: Time.Time;
    };

    // Create a stable variable to store posts
    private stable var posts : [Post] = [];
    private let postsBuffer = Buffer.Buffer<Post>(0);

    // Initialize the buffer with stable posts during upgrade
    private func loadStablePosts() {
        for (post in posts.vals()) {
            postsBuffer.add(post);
        };
    };

    // Called when canister is initialized or upgraded
    system func preupgrade() {
        posts := postsBuffer.toArray();
    };

    system func postupgrade() {
        loadStablePosts();
    };

    // Create a new post
    public shared func createPost(title: Text, content: Text, author: Text) : async () {
        let post : Post = {
            title = title;
            content = content;
            author = author;
            timestamp = Time.now();
        };
        postsBuffer.add(post);
    };

    // Get all posts
    public query func getPosts() : async [Post] {
        return postsBuffer.toArray();
    };
}
