import { z } from 'zod';

export const appointmentFormSchema = z.object({
	clientName: z.string().trim().min(2, 'Укажите имя клиента'),
	clientPhone: z.string().trim().optional(),
	serviceName: z.string().trim().min(2, 'Укажите услугу'),
	locationName: z.string().trim().min(2, 'Укажите место'),
	appointmentTime: z.string().trim().min(1, 'Укажите дату и время'),
	notes: z.string().trim().optional()
});

export const operatorFormSchema = z.object({
	name: z.string().trim().min(2, 'Укажите имя оператора'),
	email: z.email('Укажите корректный email').transform((value) => value.toLowerCase()),
	password: z.string().min(8, 'Пароль должен быть не короче 8 символов')
});

export const adminFormSchema = z.object({
	name: z.string().trim().min(2, 'Укажите имя администратора'),
	email: z.email('Укажите корректный email').transform((value) => value.toLowerCase()),
	password: z.string().min(8, 'Пароль должен быть не короче 8 символов')
});

export const loginFormSchema = z.object({
	email: z.email('Укажите корректный email').transform((value) => value.toLowerCase()),
	password: z.string().min(1, 'Введите пароль')
});

export function readFormData(formData: FormData) {
	return Object.fromEntries(formData.entries());
}
