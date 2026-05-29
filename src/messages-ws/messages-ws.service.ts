import { Injectable } from '@nestjs/common';
import { identity, retry } from 'rxjs';
import { Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

interface ConnectedClients {
    [identity: string]: {
        socket: Socket,
        user: User
    }
}
@Injectable()
export class MessagesWsService {
    private connectedClients: ConnectedClients = {}

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) { }


    //Registrar al cliente
    async registerClient(client: Socket, userId: string) {

        const user = await this.userRepository.findOneBy({ id: userId })
        if (!user) throw new Error('User not found')
        if (!user.isActive) throw new Error('User not active.')

        this.checkUserConnection(user)

        this.connectedClients[client.id] = {
            socket: client,
            user
        }
    }

    //Eliminar al cliente
    remove(clienteId: string) {

        delete this.connectedClients[clienteId]
    }

    getConnectClients(): string[] {
        return Object.keys(this.connectedClients)

    }

    getUserFullName(sockeId: string) {
        return this.connectedClients[sockeId].user.fullName
    }

    private checkUserConnection(user: User) {
        for (const clientId of Object.keys(this.connectedClients)) {
            const connectedClient = this.connectedClients[clientId]
            if (connectedClient.user.id === user.id) {
                connectedClient.socket.disconnect()
                break
            }
        }
    }
}
