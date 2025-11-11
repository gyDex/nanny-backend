import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

import * as https from 'https';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ApplicationsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly httpService: HttpService,
    ) {}

    async deleteNanny(id: string) {
        try {
            // const user = await this.prisma.nannyProfile.findFirst({
            //     where: {
            //         id: id
            //     }
            // })

            // if (!user) {
            //     console.log('User not found!')
            //     throw new NotFoundException('User not found!');
            // }

            const nanny = await this.prisma.nannyProfile.delete(
                {
                    where : {
                        id: id
                    }
                }
            )

            if (!nanny) {
                console.log('Nanny not found!')
                throw new NotFoundException('Nanny not found!');
            }

            return nanny; 
        } catch (error) {
            console.log(error)

            if (error.code === '42P01') {
                throw new InternalServerErrorException('Database configuration error');
            }

            throw new InternalServerErrorException('An unexpected error occurred');
        }
    }

    async findAll() {
        return this.prisma.nannyProfile.findMany({
            select: {
                id: true,
                personData: true,
                education: true,
                educationFile: true,
                isValidated: true,
                about: true,
                jobs: true,
                pay: true,
                question: true,
                experience: true,
                agesBaby: true,
                typePay: true,
                advantages: true,
                occupancy: true,
                charts: true,
                duties: true,
                user: {
                    select: {
                        fullName: true,
                        email: true,
                        age: true,
                        phone: true,
                        userAvatar: true,
                        residency: true,                         
                    }  
                }
            },
        });
    }

    async updateStatus(id, status) {
        try {
            
            const nanny = await this.prisma.nannyProfile.findFirst({
                where: {
                    id: id
                },
                include: {
                    user: true
                }
            })
    
            if (status === 'approved') {
                console.log('approved')
                console.log(nanny?.user?.fullName)
                let res = this.httpService.post('https://servicenanny.ru/server/send-success', {
                    email: nanny?.user?.email,
                    name: nanny?.user?.fullName,
                }, {
                    headers: {
                        'Content-Type' : 'application/json'
                    },
                    httpsAgent: new https.Agent({
                        rejectUnauthorized: false
                    })
                })
                const response = await lastValueFrom(res)

                console.log(response)
            }
    
            return this.prisma.nannyProfile.update({
                where: {
                    id: id
                },
                data: {
                    isValidated: status === 'approved' ? true : false,
                    isVisible: status === 'approved' ? true : false,
                }
            })
        } catch (error) {
            
        }

    }
}
