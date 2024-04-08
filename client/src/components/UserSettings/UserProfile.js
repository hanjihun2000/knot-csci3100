import React, { useState } from 'react';
import '../component_css/UserProfile.css';
import profilePicture from './profile-picture.jpg';
import editIcon from './edit-icon.png';
import trashIcon from './trash-icon.png';
import postImage from './post-image.jpg'; // Import your post image

const UserProfile = () => {
  const [showPosts, setShowPosts] = useState(false);
  const username = 'johndoe';
  const userDescription = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';
  const posts = [
    {
      title: 'Title of post/repost',
      author: 'postauthor',
      comment: 'Looking good!',
    },
    {
      title: 'Title of post/repost',
      author: 'postauthor',
      comment: 'I want to go there!',
    },
  ];

  const toggleView = () => {
    setShowPosts(!showPosts);
  };

  return (
    <div className="user-profile-container">
      <div className="user-info">
        <img src={profilePicture} alt="Profile" className="profile-picture" />
        <div className="user-details">
          <h2>{username}</h2>
          <p>{userDescription}</p>
        </div>
      </div>
      <div className="view-toggle">
        <button onClick={toggleView} className={showPosts ? '' : 'active'}>
          Posts
        </button>
        <button onClick={toggleView} className={showPosts ? 'active' : ''}>
          Comments
        </button>
      </div>
      {showPosts ? (
        <div className="posts-container">
          {posts.map((post, index) => (
            <div key={index} className="post">
              <div className="post-header">
                <h4>{post.title}</h4>
                <div className="post-actions">
                  <img src={editIcon} alt="Edit" className="action-icon" />
                  <img src={trashIcon} alt="Delete" className="action-icon" />
                </div>
              </div>
              <p>{post.author}</p>
              <div className="post-image">
                <img src={postImage} alt="Post" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="user-activity">
          <div className="posts">
            <h3>Posts</h3>
            {posts.map((post, index) => (
              <div key={index} className="post">
                <h4>{post.title}</h4>
                <p>{post.author}</p>
                <p>
                  <span className="username">{username}</span>'s comment: {post.comment}
                </p>
                <div className="post-actions">
                  <img src={editIcon} alt="Edit" className="action-icon" />
                  <img src={trashIcon} alt="Delete" className="action-icon" />
                </div>
              </div>
            ))}
          </div>
          <div className="comments">
            <h3>Comments</h3>
            {/* Add comments component or placeholder */}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;