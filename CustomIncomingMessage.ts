
import * as http from 'http'
import * as url from 'url'


interface CustomMessageParameters  {
    params: { [key: string]: string }
    urlParts: url.Url
}

export interface CustomIncomingMessage extends http.IncomingMessage, CustomMessageParameters {}

export function convertToCustomMessage(req: http.IncomingMessage): CustomIncomingMessage {
    var message: CustomIncomingMessage = <CustomIncomingMessage>req;
    message.urlParts = url.parse(req.url);
    message.params = message.urlParts.query || {};
    return message;
}