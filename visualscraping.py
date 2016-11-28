from urllib.error import HTTPError
import bs4
from bs4 import BeautifulSoup
from urllib.request import urlopen
import threading
import os
import json

dir = os.path.dirname(__file__)
rel = "static/"

def parse():
    try:
        # array = list()
        write_to_file = ""

        temp = rel + "education" + ".json"
        abs = os.path.join(dir, temp)
        f1 = open(abs, "r")

        temp = rel + "schools.json"
        abs = os.path.join(dir, temp)
        f2 = open(abs, "w")

        f2.write("{\"name\":\"wholesomeeducation\",\"children\":[")

        data = json.load(f1)
        for i in range(len(data["results"])):
            write_to_file += "{\"name\":\"" + data["results"][i]["name"] + "\", \"children\":["
            for j in range(len(data["results"][i]["ethnicities"])):
                    write_to_file += "{\"name\":\"" + data["results"][i]["ethnicities"][j]["name"] + "\", \"size\":" + str(data["results"][i]["ethnicities"][j]["num_students"]) + "},"
            if(write_to_file.endswith(',')):
                write_to_file = write_to_file[:-1]
            write_to_file += "]},"
        if(write_to_file.endswith(',')):
            write_to_file = write_to_file[:-1]
        write_to_file += "]}"


        f2.write(write_to_file)
        f1.close()
        f2.close()

        # temp = rel + "person_ids_" + str(y) + ".json"
        # abs = os.path.join(dir, temp)
        # f = open(abs, "w")
        # for i in array:
        #     f.write(str(i) + "\n")
        # f.close()

    except HTTPError:
        pass
    return

parse()