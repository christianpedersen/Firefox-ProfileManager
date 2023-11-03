document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('click', (event) => {
        if (event.target.tagName === 'A' && event.target.href.startsWith('http')) {
            event.preventDefault();
            fetch(`/openExternalLink?url=${event.target.href}`)
                .then(response => response.text())
                .then(data => {})
                .catch(error => console.error('Error:', error));
        }
    });
    const userAgent = navigator.userAgent;
    let os;
    if (/Windows/.test(userAgent)) {
        os = 'Windows';
    } else if (/Macintosh|Mac OS/.test(userAgent)) {
        os = 'MacOS';
    } else if (/Linux/.test(userAgent)) {
        os = 'Linux';
    } else {
        os = 'Unknown';
    }
    const profile_container = document.getElementById('profile_container')
    let profile_modal_create_button = document.getElementById('profile_modal_create_button')
    var profile_create_modal = document.getElementById('profile_create_modal')
    var profile_edit_modal = document.getElementById('profile_edit_modal')
    var create_modal = new bootstrap.Modal(profile_create_modal)
    var edit_modal = new bootstrap.Modal(profile_edit_modal)
    let create_profile_modal_name = document.getElementById('create_profile_modal_name')

    function getExistingProfiles() {
        profile_container.innerHTML = '';
        fetch('/getProfiles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ os: os })
        })
            .then((response) => response.json())
            .then((data) => {
                if (!data) {
                    console.log('empty')
                } else {
                    data.forEach(profile => {
                        let profile_box = `
                        <div class="profile_box">
                        <div class="menu_icon" id="menu_icon_${profile.id}">
                        <div class="menu_button">
                            <i class="fas fa-ellipsis-v"></i>
                        </div>
                        <div class="menu_items" id="menu_items_${profile.id}">
                            <div class="menu_item" id="menu_item_edit_${profile.id}">Edit</div>
                            <div class="menu_item" id="menu_item_delete_${profile.id}">Delete</div>
                        </div>
                        </div>
                        <div class="profile_box_inner">
                        <span>${profile.name}</span>
                        <br>
                        <div class="round-letter"  id="${profile.id}">${profile.name[0]}</div>
                        </div>
                        </div>
                        `

                        profile_container.insertAdjacentHTML('beforeend', profile_box)

                        var is_div_clickable = true;
                        document.getElementById(profile.id).addEventListener('click', function () {
                            if (is_div_clickable) {
                                profileClicked(profile.name);
                                is_div_clickable = false;
                                setTimeout(function() {
                                  is_div_clickable = true;
                                }, 2000); 
                              }
                        })

                        document.getElementById(profile.id).addEventListener('keydown', function (event) {
                            if (event.key === 'Enter') {
                                event.preventDefault();
                                profileClicked(profile.name)
                            }
                        });

                        document.getElementById(`menu_item_edit_${profile.id}`).addEventListener('click', function () { profile_edit(profile.id, profile.name) })
                        document.getElementById(`menu_item_delete_${profile.id}`).addEventListener('click', function () { profile_delete(profile.id, profile.name) })
                        const menu_icon = document.getElementById(`menu_icon_${profile.id}`)
                        const menu_items = document.getElementById(`menu_items_${profile.id}`)
                        menu_icon.addEventListener('click', function () {
                            menu_items.style.display = menu_items.style.display === 'none' ? 'block' : 'none'
                        })

                        document.addEventListener('click', function (event) {
                            if (!menu_icon.contains(event.target)) {
                                menu_items.style.display = 'none'
                            }
                        })
                    })
                }

            })
            .catch((error) => {
                console.error('Error:', error)
            })

        // Set timeout to add the add profile card at the end
        setTimeout(() => {
            profile_container.insertAdjacentHTML('beforeend', `
            <div class="profile_box_rounded" id="profile_create">
            <div class="profile_box_inner">
            <span>Add profile</span>
            <br>                
            <div class="round-letter">+</div>
            </div>
            </div>`)
            document.getElementById('profile_create').addEventListener('click', function () { 
                create_modal.show() 
                setTimeout(() => {
                    create_profile_modal_name.focus();
                }, 100);
            })

        }, 200)
    }
    getExistingProfiles()


    function profile_delete(id, name) {
        const confirmed = confirm(`Are you sure you want to delete profile '${name}'?`);
        if (!confirmed) return;

        fetch('/deleteProfile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: id, name: name, os: os })
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data.result == 'success') {
                    getExistingProfiles()
                    return showSuccessToast('Profile successfully deleted!')
                }
                console.log(data)
                return showErrorToast(`Error creating profile: ${data.error}`)
            })
            .catch((error) => {
                console.error('Error:', error)
                return showErrorToast(`Error creating profile: ${error}`)
            })
    }

    function profile_edit(id, name) {
        console.log(`profile_edit: ${id}`)
        edit_modal.show()
        let edit_profile_modal_name = document.getElementById('edit_profile_modal_name')
        edit_profile_modal_name.value = name
        setTimeout(() => {
            edit_profile_modal_name.focus();
        }, 100);

        let profile_modal_edit_button = document.getElementById('profile_modal_edit_button')
        profile_modal_edit_button.addEventListener('click', function () {
            if (edit_profile_modal_name.value) {
                fetch('/editProfile', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id: id, name: name, new_name: edit_profile_modal_name.value, os: os })
                })
                    .then((response) => response.json())
                    .then((data) => {
                        console.log(data);
                        if (data.result == 'success') {
                            edit_modal.hide()
                            getExistingProfiles()
                            return showSuccessToast('Profile successfully updated!')
                        }
                        console.log(data)
                        return showErrorToast(`Error creating profile: ${data.error}`)
                    })
                    .catch((error) => {
                        console.error('Error:', error)
                        return showErrorToast(`Error creating profile: ${error}`)
                    })
            } else {
                showErrorToast('Profile name can not be empty.')
            }
        })
    }


    profile_modal_create_button.addEventListener('click', function () {
        createProfile()
    })
    create_profile_modal_name.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            createProfile()
        }
    });

    function createProfile() {
        if (create_profile_modal_name.value) {
            fetch('/createProfile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: create_profile_modal_name.value, id: 1, image: '', os: os }),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.result == 'success') {
                        create_modal.hide()
                        getExistingProfiles()
                        create_profile_modal_name.value = ''
                        return showSuccessToast('Profile successfully created!')
                    }
                    console.log(data)
                    return showErrorToast(`Error creating profile: ${data.result.error}`)
                })
                .catch((error) => {
                    console.error('Error:', error)
                })
        } else {
            return showErrorToast(`Profile name cannot be empty.`)
        }
    }

    function profileClicked(profile_name) {
        showSuccessToast('Opening profile ..')
        fetch('/openProfile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: profile_name, os: os })
        })
            .then((response) => response.json())
            .then((data) => {
                //
            })
            .catch((error) => {
                console.error('Error:', error)
            })
    }

    function showSuccessToast(message) {
        Toastify({
            text: message,
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            offset: {
                y: 50
            },
            style: {
                background: "#215e4c",
            }
        }).showToast();
    }
    function showErrorToast(message) {
        Toastify({
            text: message,
            duration: 7000,
            close: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            offset: {
                y: 50
            },
            style: {
                background: "#9e454b",
            }
        }).showToast();
    }
});