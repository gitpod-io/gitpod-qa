import json
import http.client
import urllib.parse
from os import environ


def get_documents(base_url: str, limit: int, api_key: str):
    url = f"{base_url}/indexes/threads/documents"
    params = {
        "limit": limit,
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
    }

    parsed_url = urllib.parse.urlparse(url)
    connection = http.client.HTTPConnection(
        str(parsed_url.hostname), parsed_url.port)
    path_with_params = f"{parsed_url.path}?{urllib.parse.urlencode(params)}"

    connection.request("GET", path_with_params, headers=headers)
    response = connection.getresponse()

    # Read and parse the response content
    response_content = response.read().decode("utf-8")
    json_data = json.loads(response_content)

    connection.close()

    return json_data


def print_new_data(data: dict) -> None:

    for i, result in enumerate(data['results']):

        new_page_contents: str = " ".join(result['messages'])
        new_source: str = "https://discord.com/channels/" + \
            str(result['guild_id']) + str(result['parent_channel_id']) + \
            "/threads/" + str(result['id'])

        new_data = [
            [
                str(i),
                {
                    "pageContent": new_page_contents,
                    "metadata": {
                        "source": new_source,
                    }
                }
            ]
        ]

        print(json.dumps(new_data, indent=None))


# Fetch threads
discord_index_base_url = environ.get('DISCORD_INDEX_BASE_URL')
discord_index_api_key = environ.get('DISCORD_INDEX_API_KEY')
thread_documents = get_documents(
    str(discord_index_base_url), 3000, str(discord_index_api_key))

# Output the data in the correct format
print_new_data(thread_documents)
