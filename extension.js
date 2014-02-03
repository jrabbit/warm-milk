
const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;

const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const GnomeDesktop = imports.gi.GnomeDesktop;


let text, button;

//util
function killpid(pid){
    let [res, out, err, status] = GLib.spawn_command_line_sync('kill -15 ' + pid);
    //15 -> SIGTERM for Chrome this is a little overkill and it kills all of Chrome.
}


//Option One Kill Flash
function killflash(){
//get pid of flash from ps aux | grep flash
    let [res, out, err, status] = GLib.spawn_command_line_sync('pgrep -f flash');
    pid = parseInt(out.toString());
    if (pid < 1){
	killpid(pid);
	return true;
    }
    else{return false;};    
}

//option two kill what's producing sound.

function killsound(){
  //get what's making sound
  let [res, out, err, status] = GLib.spawn_command_line_sync('pactl list sink-inputs');
  o = out.toString();
  output = o.split("\n").map(function(x){return x.trim();});
  if (output.length < 2){
	 return false;
  }
  //string to look for
  const search = "application.process.id";
  let [val, _, pid] = output[21].split(" "); //MAGIC NUMBER.
  if (val === search){
	 killpid(pid);
	 return true;
  }
  else{return false;};
}

function forcerun(){
    if (killsound()){msg = "Killed via pulseaudio";}
    else{msg="zach is a butt";}
    _showArb(msg);
}

function _hideHello() {
    Main.uiGroup.remove_actor(text);
    text = null;
}

// implement https://developer.gnome.org/gnome-desktop3/stable/GnomeIdleMonitor.html


function _showArb(msg) {
    if (!text) {
        text = new St.Label({ style_class: 'helloworld-label', text: msg });
        Main.uiGroup.add_actor(text);
    }

    text.opacity = 255;

    let monitor = Main.layoutManager.primaryMonitor;

    text.set_position(Math.floor(monitor.width / 2 - text.width / 2),
                      Math.floor(monitor.height / 2 - text.height / 2));

    Tweener.addTween(text,
                     { opacity: 0,
                       time: 2,
                       transition: 'easeOutQuad',
                       onComplete: _hideHello });
}

function init(extensionMeta) {
    // h/t Caffeine https://github.com/eonpatapon/gnome-shell-extension-caffeine/blob/master/caffeine%40patapon.info/extension.js#L308
    let theme = imports.gi.Gtk.IconTheme.get_default();
    theme.append_search_path(extensionMeta.path + "/icons");

    button = new St.Bin({ style_class: 'panel-button',
                          reactive: true,
                          can_focus: true,
                          x_fill: true,
                          y_fill: false,
                          track_hover: true });
    let icon = new St.Icon({icon_name: 'warm-milk-bottle-erik',
			   style_class: 'system-status-icon'});
    button.set_child(icon);
    button.connect('button-press-event', forcerun);
}

function enable() {
    Main.panel._rightBox.insert_child_at_index(button, 0);
}

function disable() {
    Main.panel._rightBox.remove_child(button);
}
