const express = require('express');
const router = express.Router();
const os = require('os');
const fs = require('fs-extra');

router.get('/openExternalLink', (req, res) => {
    const url = req.query.url;
    const { shell } = require('electron');
    shell.openExternal(url);
    res.send(`Opened ${url} in default browser`);
});


router.post('/getProfiles', function (req, res) {
    let operating_system = req.body.os
    let current_user_homedir = ''
    let username = ''
    let path_to_profiles_ini = ''
    let profiles_array = []

    if (operating_system == 'Windows') {
        current_user_homedir = os.homedir();
        username = current_user_homedir.split('\\').pop();
        path_to_profiles_ini = `${current_user_homedir}\\AppData\\Roaming\\Mozilla\\Firefox\\profiles.ini`;
    }
    if (operating_system == 'MacOS') {
        current_user_homedir = os.homedir();
        username = current_user_homedir.split('/').pop();
        path_to_profiles_ini = `/Users/${username}/Library/Application Support/Firefox/profiles.ini`;

    }
    if (operating_system == 'Linux') {
        current_user_homedir = os.homedir();
        username = current_user_homedir.split('/').pop();
        if (username == 'root') {
            path_to_profiles_ini = `/root/.mozilla/firefox/profiles.ini`;
        } else {
            path_to_profiles_ini = `/home/${username}/.mozilla/firefox/profiles.ini`;
        }
        console.log(current_user_homedir);
        console.log(username);
        console.log(path_to_profiles_ini);
    }

    // Read the profiles.ini file
    fs.readFile(path_to_profiles_ini, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        const name_regex = /\bName=([^\n]+)\b/g;
        const path_regex = /\bPath=(\S+)\b/g;
        const name_matches = data.match(name_regex);
        const path_matches = data.match(path_regex);
        if (name_matches && path_matches) {
            for (let i = 0; i < name_matches.length; i++) {
                const profile_name = name_matches[i].split('=')[1];
                const profile_path = path_matches[i].split('=')[1];
                profiles_array.push({ name: profile_name, id: profile_path, image: '' });
            }
            profiles_array.sort()
            res.json(profiles_array)
        } else {
            console.log('No matching Name and Path values found.');
        }
    });
});

router.get('/', function (req, res, next) {
    res.render('index', { title: 'Firefox Profile Manager' })
});

router.post('/createProfile', function (req, res, next) {
    let profile_name = req.body.name;
    let operating_system = req.body.os
    let command = ''

    console.log(req.body);
    console.log(req.body.os);
    if (operating_system == 'Windows') {
        command = `"C:\\Program Files\\Mozilla Firefox\\firefox.exe" --no-remote -CreateProfile "${profile_name}"`;
    }
    if (operating_system == 'MacOS') {
        command = `/Applications/Firefox.app/Contents/MacOS/firefox-bin --no-remote -CreateProfile "${profile_name}"`;
    }
    if (operating_system == 'Linux') {
        command = `firefox --no-remote -CreateProfile "${profile_name}"`;
    }

    if (!operating_system) {
        command = '';
    }

    require('child_process').exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error}`);
            res.json({ error: `Error executing command: ${error}` })
            return;
        } else {
            res.json({ result: 'success' })
        }
        console.log(`output: ${stdout}`);
        console.error(`error: ${stderr}`);
    });
});

router.post('/openProfile', function (req, res, next) {
    let operating_system = req.body.os
    console.log(req.body);
    console.log(req.body.os);
    let profile_name = req.body.name
    let command = ''

    if (operating_system == 'Windows') {
        command = `"C:\\Program Files\\Mozilla Firefox\\firefox.exe" -p ${profile_name}`;
        require('child_process').exec(command);
    }
    if (operating_system == 'MacOS') {
        command = `/Applications/Firefox.app/Contents/MacOS/firefox-bin -p ${profile_name}`;
        require('child_process').exec(command);
    }
    if (operating_system == 'Linux') {
        command = `/usr/bin/firefox -p ${profile_name}`;
        require('child_process').exec(command);
    }
});

router.post('/deleteProfile', function (req, res, next) {
    console.log(req.body);
    let profile_id = req.body.id
    let profile_name = req.body.name
    let operating_system = req.body.os

    let current_user_homedir = ''
    let username = ''
    let path_to_profiles_ini = ''
    let profiles_folder = ''

    if (operating_system == 'Windows') {
        current_user_homedir = os.homedir();
        username = current_user_homedir.split('\\').pop();
        path_to_profiles_ini = `${current_user_homedir}\\AppData\\Roaming\\Mozilla\\Firefox\\profiles.ini`;
        profiles_folder = `${current_user_homedir}\\AppData\\Roaming\\Mozilla\\Firefox\\Profiles`;
    }
    if (operating_system == 'MacOS') {
        current_user_homedir = os.homedir();
        username = current_user_homedir.split('/').pop();
        path_to_profiles_ini = `/Users/${username}/Library/Application Support/Firefox/profiles.ini`;
        profiles_folder = `/Users/${username}/Library/Application Support/Firefox/Profiles`;
    }
    if (operating_system == 'Linux') {
        current_user_homedir = os.homedir();
        username = current_user_homedir.split('/').pop();
        path_to_profiles_ini = `/home/${username}/.mozilla/firefox/profiles.ini`;
        profiles_folder = `/home/${username}/.mozilla/firefox`;
    }

    if (!operating_system) {
        res.json({error: 'Could not get operating system.'})
    }

    fs.readFile(path_to_profiles_ini, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.json({ error: err })
            return;
        }

        const profile_regex = new RegExp(`\\[Profile\\d+\\]\\s+Name=${profile_name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+IsRelative=1\\s+Path=${profile_id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
        const match = profile_regex.exec(data);

        console.log(profile_regex);
        console.log(match);

        if (match) {
            const updated_data = data.replace(profile_regex, '');

            fs.writeFile(path_to_profiles_ini, updated_data, 'utf8', (err) => {
                if (err) {
                    console.error(err);
                    res.json({ error: err })
                    return;
                }
                console.log(`Profile ${profile_name} removed from ini file.`);
                fs.readdir(profiles_folder, (err, files) => {
                    if (err) {
                        console.error(err);
                        res.json({ error: err })
                        return;
                    }
                    const profile_folder = files.find(file => file.includes(profile_id.replace(/^Profiles\//, '')));
                    if (profile_folder) {
                        let path_to_profile_folder = `${profiles_folder}/${profile_folder}`;
                        if (operating_system == 'Windows') {   
                            path_to_profile_folder = `${profiles_folder}\\${profile_folder}`;
                        }

                        fs.remove(path_to_profile_folder, (err) => {
                            if (err) {
                                console.error(err);
                                res.json({ error: err })
                                return;
                            }
                            console.log(`Folder '${path_to_profile_folder}' removed successfully`);
                            console.log(`Profile '${profile_name}' removed successfully`);
                            res.json({ result: 'success' })
                        });
                    } else {
                        res.json({ error: `Profile for '${profile_name}' not found` })
                        console.log(`Profile for '${profile_name}' not found`);
                    }
                });
            });
        } else {
            res.json({ error: `Profile with name '${profile_name}' and path '${profile_id}' not found.` })
            console.log(`Profile with name '${profile_name}' and path '${profile_id}' not found.`);
        }
    });
});

router.post('/editProfile', function (req, res, next) {
    let profile_id = req.body.id;
    let profile_name = req.body.name;
    let new_name = req.body.new_name;
    let operating_system = req.body.os


    let current_user_homedir = ''
    let username = ''
    let path_to_profiles_ini = ''

    if (operating_system == 'Windows') {
        current_user_homedir = os.homedir();
        username = current_user_homedir.split('\\').pop();
        path_to_profiles_ini = `${current_user_homedir}\\AppData\\Roaming\\Mozilla\\Firefox\\profiles.ini`;
    }
    if (operating_system == 'MacOS') {
        current_user_homedir = os.homedir();
        username = current_user_homedir.split('/').pop();
        path_to_profiles_ini = `/Users/${username}/Library/Application Support/Firefox/profiles.ini`;
    }
    if (operating_system == 'Linux') {
        current_user_homedir = os.homedir();
        username = current_user_homedir.split('/').pop();
        path_to_profiles_ini = `/home/${username}/.mozilla/firefox/profiles.ini`;           
    }

    if (!operating_system) {
        return "error";
    }

    fs.readFile(path_to_profiles_ini, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.json({ error: err });
            return;
        }
        const profile_regex = new RegExp(`\\[Profile\\d+\\][\\s\\S]*?Name=${profile_name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:[\\s\\S]*?)Path=${profile_id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
        const match = profile_regex.exec(data);

        if (match) {
            const updated_data = data.replace(`Name=${profile_name}`, `Name=${new_name}`);

            fs.writeFile(path_to_profiles_ini, updated_data, 'utf8', (err) => {
                if (err) {
                    console.error(err);
                    res.json({ error: err });
                    return;
                }
                console.log(`Profile with Name '${profile_name}' and Path '${profile_id}' updated to '${new_name}'.`);
                res.json({ result: 'success' });
            });
        } else {
            res.json({ error: `Profile with Name '${profile_name}' and Path '${profile_id}' not found.` });
            console.log(`Profile with Name '${profile_name}' and Path '${profile_id}' not found.`);
        }
    });
});

module.exports = router;