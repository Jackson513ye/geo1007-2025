import csv
import urllib
import json
from pathlib import Path
from typing import Dict, List, Tuple
import urllib.error
import urllib.request

API_ROOT = "http://localhost:8080/FROST-Server.HTTP-2.3.1/v1.1"
API_END_POINTS = {
    "Datastreams": API_ROOT + "/Datastreams",
    "FeaturesOfInterest" : API_ROOT + "/FeaturesOfInterest",
    "HistoricalLocations": API_ROOT + "/HistoricalLocations",
    "Locations": API_ROOT + "/Locations",
    "Observations": API_ROOT + "/Observations",
    "ObservedProperties": API_ROOT + "/ObservedProperties",
    "Sensors": API_ROOT + "/Sensors",
    "Things": API_ROOT + "/Things"
    }
DATA_PATH = Path('data/lab7/parking_available_20250512T1418Z.csv')
LOCATION_TO_DATASTREAM_MAP = {
    "P1":1,
    "P2":2,
    "P3":3,
    "P4":4,
    "P5":5,
    "P6":6
    }

class SensorThingsCreator():
    """
    A class for creating entities in the SensorThings API.

    Args:
        - api_endpoint_urls (Dict[str, str]): A dictionary containing the API 
        endpoint URLs.
        - data_path (Path): The path to the data file.
        - location_to_datastream_map (Dict[str, int]): A dictionary mapping 
        location names to datastream IDs.

    Attributes:
        - api_endpoint_urls (Dict[str, str]): A dictionary containing the API 
        endpoint URLs.
        - data_path (Path): The path to the data file.
        - location_to_datastream_map (Dict[str, int]): A dictionary mapping 
        location names to datastream IDs.
        - _thingDBpopulated (bool): Indicates whether the Thing database has been 
        populated.
        - _locationDBpopulated (bool): Indicates whether the Location database has 
        been populated.
        - _datastreamDBpopulated (bool): Indicates whether the Datastream database 
        has been populated.
        - _observationsDBpopulated (bool): Indicates whether the Observations 
        database has been populated.
    """

    def __init__(self,
                 api_endpoint_urls: Dict[str, str],
                 data_path: Path,
                 location_to_datastream_map: Dict[str, int]
                 ) -> None:
        self.api_endpoint_urls = api_endpoint_urls
        self.data_path = data_path
        self.location_to_datastream_map = location_to_datastream_map
        self._thingDBpopulated: bool = False
        self._locationDBpopulated: bool = False
        self._datastreamDBpopulated: bool = False
        self._observationsDBpopulated: bool = False
        
    def create_Thing(self,
                     names:List[str], 
                     descriptions:List[str], 
                     properties:List[Dict[str, str]]
                     ) -> None:
        """
        Creates things with the given names, descriptions, and properties.

        Args:
            - names (List[str]): A list of names for the things.
            - descriptions (List[str]): A list of descriptions for the things.
            - properties (List[Dict[str, str]]): A list of dictionaries 
            representing the properties of the things.

        Raises:
            - InterruptedError: If things have already been created.
            - ValueError: If the lengths of `names`, `descriptions`, and 
            `properties` are not equal.

        Returns:
            None
        """
        if self._thingDBpopulated == True:
            raise InterruptedError("Things have already been created.")
        if not len(names) == len(descriptions) == len(properties):
            raise ValueError("Arguments must have same length.")
        for i in range(len(names)):
            payload = json.dumps(
                {
                    "name": names[i],
                    "description": descriptions[i],
                    "properties": properties[i]
                }
            ).encode("utf-8")
            request = urllib.request.Request(
                self.api_endpoint_urls["Things"], 
                data=payload, 
                method='POST'
            )
            request.add_header('Content-Type','application/json')
            try:
                with urllib.request.urlopen(request) as response:
                    print(response.getcode())
            except urllib.error.HTTPError as e:
                print(e.read())
                break
        self._thingDBpopulated = True

    def create_Location(
            self,
            names:List[str], 
            descriptions:List[str], 
            properties:List[Dict[str, str]],
            coordinates:List[Tuple[int, int]]) -> None:
        """
        Creates locations in the database.

        Args:
            - names (List[str]): A list of location names.
            - descriptions (List[str]): A list of location descriptions.
            - properties (List[Dict[str, str]]): A list of dictionaries 
            representing location properties.
            - coordinates (List[Tuple[int, int]]): A list of coordinate tuples 
            representing the location coordinates.

        Raises:
            - InterruptedError: If locations have already been created.
            - ValueError: If the lengths of the input lists are not the same.

        Returns:
            None
        """
        if self._locationDBpopulated == True:
            raise InterruptedError("Location have already been created.")
        if not len(names) == len(descriptions) == len(properties):
            raise ValueError("Arguments must have same length.")
        for i in range(len(names)):
            payload = json.dumps(
                {
                    "name": names[i],
                    "description": descriptions[i],
                    "properties": properties[i],
                    "encodingType": "application/geo+json",
                    "location": {"type":"Point",
                                "coordinates":coordinates[i]},
                    "Things": [{"@iot.id": i+1}]
                    }
                ).encode("utf-8")
            request = urllib.request.Request(
                self.api_endpoint_urls["Locations"], 
                data=payload, 
                method='POST'
                )
            request.add_header('Content-Type','application/json')
            try:
                with urllib.request.urlopen(request) as response:
                    print(response.getcode())
            except urllib.error.HTTPError as e:
                print(e.read())
                break
        self._locationDBpopulated = True

    def create_Datastreams(
        self,
        names: List[str],
        descriptions: List[str]
    ) -> None:
        """
        Creates datastreams in the database.

        Args:
            - names (List[str]): A list of names for the datastreams.
            - descriptions (List[str]): A list of descriptions for the datastreams.

        Raises:
            - InterruptedError: If the database has already been created.
            - ValueError: If the lengths of `names` and `descriptions` are not equal.

        Returns:
            None
        """
        if self._datastreamDBpopulated == True:
            raise InterruptedError("Database have already been created.")
        if not len(names) == len(descriptions):
            raise ValueError("Arguments must have same length.")
        for i in range(len(names)):
            payload = json.dumps(
                {
                    "name": names[i],
                    "description": descriptions[i],
                    "observationType": 'null',
                    "unitOfMeasurement": {
                        "name": "Parking Space",
                        "symbol": "no",
                        "definition": "number of clear parking spaces"
                    },
                    "Thing":{"@iot.id": i+1},
                    "Sensor":{"@iot.id": 1},
                    "ObservedProperty": {"@iot.id":1}
                }
            ).encode("utf-8")
            request = urllib.request.Request(
                self.api_endpoint_urls["Datastreams"], 
                data=payload, 
                method='POST'
            )
            request.add_header('Content-Type','application/json')
            try:
                with urllib.request.urlopen(request) as response:
                    print(response.getcode())
            except urllib.error.HTTPError as e:
                print(e.read())
                break
        self._datastreamDBpopulated = True

    def create_ObservedProperty(self) -> None:

        payload = json.dumps(
                {
                    "name": "Free Parking spaces",
                    "description": "Parking spaces",
                    "properties": {},
                    "definition": "Empty parking spaces."
                    }
                ).encode("utf-8")
        request = urllib.request.Request(
                self.api_endpoint_urls["ObservedProperties"], 
                data=payload, 
                method='POST'
                )
        request.add_header('Content-Type','application/json')
        try:
            with urllib.request.urlopen(request) as response:
                print(response.getcode())
        except urllib.error.HTTPError as e:
            print(e.read())
    
    def create_Sensor(self) -> None:

        payload = json.dumps(
                {
                    "name": "Some Parking Sensor",
                    "description": "A parking sensor we know nothing about.",
                    "properties": {},
                    "encodingType": "null",
                    "metadata": "null",
                    }
                ).encode("utf-8")
        request = urllib.request.Request(
                self.api_endpoint_urls["Sensors"], 
                data=payload, 
                method='POST'
                )
        request.add_header('Content-Type','application/json')
        try:
            with urllib.request.urlopen(request) as response:
                print(response.getcode())
        except urllib.error.HTTPError as e:
            print(e.read())

    def add_observations(self) -> None:
        if self._observationsDBpopulated == True:
            raise InterruptedError("Observations have already been created.")
        with open(DATA_PATH, "r") as f:
            for id, line in enumerate(csv.reader(f, delimiter=";")):
                date, loc, reading = line
                payload = json.dumps({
                    "result" : reading, 
                    "Datastream": {"@iot.id": LOCATION_TO_DATASTREAM_MAP[loc]},
                    "phenomenonTime": date
                }
            ).encode("utf-8")
                request = urllib.request.Request(
                    self.api_endpoint_urls["Observations"], 
                    data=payload, 
                    method='POST'
                    )
                request.add_header('Content-Type','application/json')
                try:
                    with urllib.request.urlopen(request) as response:
                        print(f"{response.getcode()} - Created entity: {id+1} of 77358")
                except urllib.error.HTTPError as e:
                    print(e.read())

###############################################################################
################# DATA STARTS HERE ############################################

if __name__ == "__main__":
    ## Location data:
    location_names = [
        "Van der Waalsweg, Delft",
        "Van Den Broekweg, Delft",
        "Van der Maasweg 11, Delft",
        "Kluyverweg 1, Delft",
        "Cornelis Drebbelweg 1, Delft",
        "Zuidplantsoen, Delft"
        ]
    location_descriptions = ['null', 'null', 'null', 'null', 'null','null']
    location_properties = [{},{},{},{},{},{}]
    location_coords = [
        (4.3753217265647715, 52.001401400000006),
        (4.378289595882866, 51.995834505946036,),
        (4.3796559934685835, 51.98902558688054),
        (4.375407295459066, 51.99002160897592),
        (4.369542097678816, 51.998395366361954),
        (4.3715966517066756, 52.00548141262594)
                ]
    ## Thing data:
    thing_names = ["Van der Waalsweg Carpark",
            "Van Den Broekweg Carpark",
            "Van der Maasweg 11 Carpark",
            "Kluyverweg 1 Carpark",
            "Cornelis Drebbelweg 1 Carpark",
            "Zuidplantsoen Carpark"]
    thing_descriptions = ['null', 'null', 'null', 'null', 'null', 'null']
    thing_properties = [{},{},{},{},{},{}]
    # Datastream data:
    datastream_names = ["Van der Waalsweg Stream",
            "Van Den Broekweg Stream",
            "Van der Maasweg 11 Stream",
            "Kluyverweg 1 Stream",
            "Cornelis Drebbelweg 1 Stream",
            "Zuidplantsoen Stream"]
    datastream_descriptions = ['null', 'null', 'null', 'null', 'null','null']
    # create SensorThings
    sensor_things_creator = SensorThingsCreator(
        api_endpoint_urls=API_END_POINTS,
        data_path=DATA_PATH,
        location_to_datastream_map=LOCATION_TO_DATASTREAM_MAP
        )
    sensor_things_creator.create_Thing(
        thing_names, 
        thing_descriptions, 
        thing_properties
        )
    sensor_things_creator.create_Location(
        location_names, 
        location_descriptions, 
        location_properties, 
        location_coords
        )
    sensor_things_creator.create_ObservedProperty()
    sensor_things_creator.create_Sensor()
    sensor_things_creator.create_Datastreams(
        datastream_names, 
        datastream_descriptions
        )
    sensor_things_creator.add_observations()
