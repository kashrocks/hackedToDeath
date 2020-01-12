import json
import pprint

GUESTS = {}
# {guest_name: {locations: [last_5_locations]}, access_point : '' }}
# {guest_name: {epochtime : {location: curr_location, access_point : '' }}}
def main():
    with open('martello-hack-data-v1.json') as json_file:
        data = json.load(json_file)
        # print(data)
        # for holding elevator events
        motion_sensor = {"elevator": '', 'stairwell': ''}
        # motion_sensor = {"elevator" : epoch time, 'stairwell' : epoch time}

        TEMPCOUNT = 0
        for epoch in data:
            
            # looping over epoch data
            # print(data[epoch])
            guest_name = data[epoch]['guest-id']
            # checking if the guest is not in the dataset, if not create one
            if (data[epoch]['guest-id'] not in GUESTS.keys()) and data[epoch]['guest-id'] != 'n/a':
                # GUESTS[guest_name] = {'location': '', 'access_point': ''}
                GUESTS[guest_name] = {}
            # --- above is good

            # if motion is a door sensor
            if data[epoch]['device'] == 'door sensor':
                if data[epoch]['event'] == 'successful keycard unlock':
                    last_epoch = min(GUESTS[guest_name].keys(), key=lambda x: abs(int(x)-int(epoch)))

                    # this sets the current location and accesspoint
                    GUESTS[guest_name][epoch] = {}
                    GUESTS[guest_name][epoch]['location'] = data[epoch]['device-id']
                    GUESTS[guest_name][epoch]['access_point'] = GUESTS[guest_name][last_epoch]['access_point']
                elif data[epoch]['event'] == 'unlocked no keycard':
                    # dont need to do anything as we dont give fook
                    pass

            # if motion sensor
            elif data[epoch]['device'] == 'motion sensor':
                # if the motion was in an elevator or stairwell update the temp s variable
                if data[epoch]['device-id'] == 'elevator':
                    motion_sensor['elevator'] = epoch
                elif data[epoch]['device-id'] == 'stairwell':
                    motion_sensor['stairwell'] = epoch
                elif data[epoch]['device-id'] == 'ice machine':
                    GUESTS['Kristina'][epoch] = {'access_point': 'ap2-3', 'location': '234'}
                    
            # if access point event
            elif data[epoch]['device'] == 'access point':

                # check if guest is disconnecting
                if data[epoch]['event'] == 'user disconnected':
                    GUESTS[guest_name][epoch] = {'access_point': 'ap1-4', 'location': '0'}
                    continue

                last_epoch = 0
                if (GUESTS[guest_name].keys()):
                    # this gets the last epoch
                    last_epoch = min(GUESTS[guest_name].keys(
                    ), key=lambda y: abs(int(y)-int(epoch)))

                # the below sets the current epoch
                GUESTS[guest_name][epoch] = {}
                GUESTS[guest_name][epoch]['access_point'] = data[epoch]['device-id']

                if data[epoch]['device-id'] == 'ap1-1':
                    # if there are in conference room they are in room 110
                    GUESTS[guest_name][epoch]['location'] = '110'
                else:
                    # if they connected to a rando wifi they are now in hallway
                    GUESTS[guest_name][epoch]['location'] = data[epoch]['device-id']

                if last_epoch != 0:
                    # check if the last epoch they were on a different floor
                    last_floor = GUESTS[guest_name][last_epoch]['access_point'][2]
                    curr_floor = GUESTS[guest_name][epoch]['access_point'][2]

                    if last_floor != curr_floor:

                        if (GUESTS[guest_name][epoch]['access_point'] not in ['ap2-2', 'ap1-2']):
                            GUESTS[guest_name][motion_sensor["elevator"]] = {'access_point': 'elevator', 'location': '199'}
                            motion_sensor["elevator"] = 'PUNJABIIIIIIIII'
                        else:
                            # its a stairwell figure it out
                            GUESTS[guest_name][motion_sensor["stairwell"]] = {'access_point': 'stairwell', 'location': '150'}
                            motion_sensor["stairwell"] = 'PUNJABIIIIIIIII'

    with open('analyzedData.json', 'w') as outfile:
        json.dump(GUESTS, outfile)

    #pprint.pprint(GUESTS)
    
