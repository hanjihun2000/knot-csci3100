const express = require("express");
const app = express();
const cors = require('cors');
// Enable All CORS Requests for development
app.use(express.json())
app.use(cors());

const multer = require("multer");
const router = express.Router();
const User = require("../models/user");
const Post = require("../models/post");
const jwt = require('jsonwebtoken');
const upload = multer({ storage: multer.memoryStorage() });

router.post("/register", upload.none(), async (req, res) => {
    // req.body for form
    // console.log(req);
    // console.log(req.body);
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
	console.log(username, password, email);
    // check if the username is inside the users database
	const userExists = await User.exists({ username: username });
	const emailExists = await User.exists({ email: email });
	if (userExists) {
		// if the username is already taken, return an error
		console.log("UsernameExistsError!");
        // send error response
        return res.send({ status: "error", message: "Username already exists!" });
	} else if (emailExists){
		// if the email is already taken, return an error
		console.log("EmailExistsError!");
		// send error response
		return res.send({ status: "error", message: "Email already exists!" });
	} else if (!username || !password || !email) {
		// if the username, password, or email is empty, return an error
		console.log("EmptyFieldError!");
		// send error response
		return res.send({ status: "error", message: "Please fill in all fields!" });
	} else {
		// create a new user account
		const user = new User({
			username: username,
			password: password,
			email: email,
			accountType: "user",
			profilePicture: {
				buffer: null,
				mimetype: null
			},
			bio: null,
			theme: null,
			followers: [],
			following: []
		});
		user.save();
        // send success response
        return res.send({ status: "success", message: "User account created successfully!"});
	}
});

// router.get('/test', upload.none(), async (req, res) => {
// 	console.log(req.body.test);
// 	res.send("Hello World!");
// });

router.get("/fetchUser", upload.none(), async (req, res) => {
	try {
		const username = req.query.username;
		console.log(username);
		const user = await User.findOne({ username: username });

		if (!user) {
			return res.status(404).json({ message: "User not found!" });
		}

		const userInfo = {
			username: user.username,
			email: user.email,
			accountType: user.accountType,
			profilePicture: user.profilePicture,
			bio: user.bio,
			theme: user.theme,
			followers: user.followers,
			following: user.following
		};

		res.json(userInfo);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

router.post("/login", upload.none(), async (req, res) => {
	console.log(req.body)
	try {
	  const { username, password } = req.body;
  
	  // Find the user by username
	  const user = await User.findOne({ username });
  
	  if (!user) {
		return res.status(401).json({ message: "Invalid username or password" });
	  }
  
	  // Check if the password is correct
	  if (user.password !== password) {
		return res.status(401).json({ message: "Invalid username or password" });
	  }
  
	  // TODO: Generate and send a token for authentication
  
	  res.json({ message: "Login successful" });
	} catch (error) {
	  res.status(500).json({ message: error.message });
	}
});

router.post("/logout", upload.none(), (req, res) => {
try {
	// TODO: Invalidate the token or perform any necessary logout actions

	res.json({ message: "Logout successful" });
} catch (error) {
	res.status(500).json({ message: error.message });
}
});

router.put("/editUserProfile", upload.single('profilePicture'), async (req, res) => {
	try {
	  const { username } = req.body;
  
	  // Find the user by username
	  const user = await User.findOne({ username: username });
  
	  if (!user) {
		return res.status(404).json({ message: "User not found!" });
	  }
  
	  // Update the fields
	  for (const field in req.body) {
		user[field] = req.body[field];
	  }
  
	  // Add image to user with buffer and mimetype
	  if (req.file) {
		user.profilePicture = {
		  buffer: req.file.buffer,
		  mimetype: req.file.mimetype
		};
	  } else {
		//set empty buffer
		user.profilePicture = {
		  buffer: null,
		  mimetype: null
		}
	  }
  
	  // Save the updated user
	  const updatedUser = await user.save();
  
	  res.status(200).json(updatedUser);
	} catch (error) {
	  res.status(500).json({ message: error.message });
	}
  });


router.get("/viewProfilePicture", async (req, res) => {
try {
	const username = req.query.username;
	console.log(username);

	// Find the user by username
	const user = await User.findOne({ username: username });

	if (!user) {
		return res.status(404).json({ message: "User not found!" });
	}

	if (!user.profilePicture || !user.profilePicture.buffer) {
		return res.status(404).json({ message: "Profile picture not found!" });
	}

	// Set the response headers
	res.set("Content-Type", user.profilePicture.mimetype);

	// Send the profile picture buffer as the response
	res.send(user.profilePicture.buffer);
} catch (error) {
	res.status(500).json({ message: error.message });
}
});

router.get("/fetchUserPosts", upload.none(), async (req, res) => {

    const username = req.query.username;
    const sender = req.query.sender;
    
    const user = await User.findOne({ username: username }).select("accountType follower");
    if (!user) {
        return res.status(404).json({ status: "error", message: "Username does not exist!" });
    }

    //if user accountType is private, and the sender is not a follower of user, return an error
    if (user.accountType === "private" && (!user.follower || !user.follower.includes(sender)) 
	&& sender !== username && sender !== "admin") {
        return res.status(403).json({ status: "error", message: "User account is private!" });
    }

    const posts = await Post.find({ username: username });

    if (!posts) {
        return res.status(404).json({ status: "error", message: "User has no posts!" });
    }

    res.status(200).json({ status: "success", message: "User posts fetched!", posts: posts });
});

router.get("/viewFollowers", async (req, res) => {
	try {
		const requestedUsername = req.query.username;
		const user = await User.findOne({ username: requestedUsername });
		if (!user) {
			return res.status(404).json({ message: "User not found!" });
		}
		const followers = user.followers;
		const followerUsers = await Promise.all(
			followers.map(async (followerUsername) => {
			  const followerUser = await User.findOne({ username: followerUsername }).select("username profilePicture");
			  return followerUser ? followerUser : null;
			})
		  );
		res.json(followerUsers);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

router.get("/viewFollowing", async (req, res) => {
	try {
		const {username} = req.query;
		const user = await User.findOne({ username: username }).select("following");
		if (!user) {
			return res.status(404).json({ message: "User not found!" });
		}

		// console.log(user)
		const {following} = user;

		console.log(following);

		const updatedFollowing = await Promise.all(
			following.map(async (followingUser) => {
				// Find the user by username
				const newFollowingUser = await User.findOne({ username: followingUser }).select("username profilePicture");
				console.log(newFollowingUser)
				return newFollowingUser ? newFollowingUser : null;
			})
		);
		  
		// Filter out any null values (i.e., usernames not found in the database)
		const filteredFollowing = updatedFollowing.filter(username => username !== null);

		user.following = filteredFollowing;
		await user.save();
	
		res.status(200).json(user.following);
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: error.message });
	}
});

// router.get("/test", upload.none(), async (req, res) => {
// 	console.log(req.body.test);
// 	res.send("Hello World!");
// });

router.get('/searchUsers', upload.none(), async (req, res) => {
	try {
		const {username, searchTerm} = req.query;

		// Find the user by username
		const user = await User.findOne({username}).select("following followers");

		if (!user) {
			return res.status(404).json({ message: "Search user not found!" });
		}

		const followingList = user.following;
		const followerList = user.followers;
		console.log(followingList)
		console.log(followerList)

		// Filter users which have the search term in their username
		const matchedUsers = await User.find({ username: {
			$regex: searchTerm,
			$options: "i"
		} }).select("username");
		const matchedUsernames = matchedUsers.map(user => user.username);

		console.log(matchedUsers);

		// Prioritize users from the searcher's following and follower lists
		const prioritizedUsers = [username, ...followingList, ...followerList].filter(user => matchedUsernames.includes(user));
		console.log(prioritizedUsers);
		const otherUsers = matchedUsernames.filter(user => !prioritizedUsers.includes(user));
	
		// Combine the prioritized and other users into a single list
		const searchResults = [...prioritizedUsers, ...otherUsers];
	
		res.status(200).json(searchResults);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});


// router.get("/fetchAllUsers", async (req, res) => {
// 	const users = await User.find();
// 	res.status(200).json(users);
// })

// router.get("/fetchAllUsernames", async (req, res) => {
// 	const users = await User.find();
// 	const usernames = users.map(user => user.username);
// 	res.status(200).json(usernames);
// })

module.exports = router;
