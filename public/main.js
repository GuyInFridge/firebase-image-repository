const storageRef = firebase.storage().ref();
const provider = new firebase.auth.GoogleAuthProvider();
let current_user = firebase.auth().currentUser;
let signedIn = false;
let image_counter = 0;
let images = [];

function uploadImage() {
    loading_gif.hidden=false;
    const file = image_upload.files[0];

    if (!file) {
        alert("No file chosen!")
        loading_gif.hidden=true;
        return
    }

    const fileRef = storageRef.child(file.name + new Date())

    fileRef.put(file).then(() => {
        image_upload.files = [];  // clear uploaded image
        loading_gif.hidden=true;
        alert('Image uploaded successfully!');
    }).catch(error => {
        if (!current_user) {
            alert("Please sign in to upload images!")
            loading_gif.hidden=true;
        } else {
            alert("Error occurred while uploading: " + error)
            loading_gif.hidden=true;
        }
    });
}

function getFileExtension(file) {
    return file.name.split('.').pop()
}

function signIn() {
    if (!signedIn) {
        firebase.auth().signInWithPopup(provider).then(result => {
            const token = result.credential.accessToken;
            const user = result.user;
            signedIn = true
            document.getElementById('sign-in').innerHTML = "Sign Out";
            alert("Signed in successfully")
        }).catch(() => {
            alert("There was an error signing you in. Please contact the developer of this crude web app immediately.")
        });
    } else {
        firebase.auth().signOut().then(function() {
            signedIn = false
            document.getElementById('sign-in').innerHTML = "Sign In";
            console.log("Signed out successfully")
        }).catch(err => {
            alert("There was an error signing you out: " + err)
        });
    }
}

function setImage(index) {
    try {
        images[index].getDownloadURL().then(url => {
            selected_image.src = url

            selected_image.onload = () => {
                if (next_image.hidden || previous_image.hidden) {
                    next_image.hidden = false;
                    previous_image.hidden = false;
                }
            }

            image_counter_text.innerHTML = (image_counter + 1).toString() + "/" + (images.length).toString()
        });
    } catch (err) {
        console.log("Error setting image to index: " + index);
    }
}

function changeImage(value) {
    image_counter += value

    if (value === 1) {
        if (image_counter > images.length - 1) {  // Next image
            image_counter = 0
        }
    } else if (value === -1) {
        if (image_counter < 0) {
            image_counter = images.length - 1  // Previous image
        }
    } else {
        throw Error("Error attempting to change image.")
    }

    setImage(image_counter)
    console.log("Set image: ", image_counter)
}

function checkFileType(file) {
    let file_ext = getFileExtension(file);
    if (!supported_filetypes.includes(file_ext)) {
        alert("Unsupported file type. This app supports the following image types: " +
            supported_filetypes.toString())
        return false
    }
    return true
}

// Load in images from storage
storageRef.listAll().then(res => {
    images = res.items

    if (images.length !== 0) {
        console.log("All images loaded")
        setImage(0);
    } else {
        console.log("No images found in storage.")
        selected_image.src = default_image_path
    }
});
